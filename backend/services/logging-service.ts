import { SupabaseClient } from "@supabase/supabase-js";

export interface AILogEntry {
  userId?: string | null;
  studentId?: string | null;
  aiService: string;
  operationType: string;
  requestData?: any;
  responseData?: any;
  tokensUsed?: number;
  cost?: number;
  durationMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface ActivityLogEntry {
  userId: string;
  activityType: string;
  metadata?: any;
  timestamp?: Date;
}

export class LoggingService {
  constructor(private supabase: SupabaseClient) {}

  async logAICall(entry: AILogEntry): Promise<void> {
    try {
      const { error } = await this.supabase.from('ai_logs').insert({
        user_id: entry.userId,
        student_id: entry.studentId,
        ai_service: entry.aiService,
        operation_type: entry.operationType,
        request_data: entry.requestData,
        response_data: entry.responseData,
        tokens_used: entry.tokensUsed,
        cost: entry.cost,
        duration_ms: entry.durationMs,
        status: entry.status,
        error_message: entry.errorMessage,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('[LoggingService] Failed to log AI call:', error);
      } else {
        console.log(`[LoggingService] Logged ${entry.operationType} AI call - ${entry.status}`);
      }
    } catch (error) {
      console.error('[LoggingService] Exception while logging AI call:', error);
    }
  }

  async logActivity(entry: ActivityLogEntry): Promise<void> {
    try {
      const { error } = await this.supabase.from('learning_sessions').insert({
        student_id: entry.userId,
        session_type: entry.activityType,
        started_at: entry.timestamp || new Date().toISOString(),
        activities: entry.metadata,
      });

      if (error) {
        console.error('[LoggingService] Failed to log activity:', error);
      } else {
        console.log(`[LoggingService] Logged activity: ${entry.activityType}`);
      }
    } catch (error) {
      console.error('[LoggingService] Exception while logging activity:', error);
    }
  }

  async getAILogs(params: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    try {
      let query = this.supabase
        .from('ai_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }

      if (params.startDate) {
        query = query.gte('created_at', params.startDate.toISOString());
      }

      if (params.endDate) {
        query = query.lte('created_at', params.endDate.toISOString());
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[LoggingService] Failed to fetch AI logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[LoggingService] Exception while fetching AI logs:', error);
      return [];
    }
  }

  async getAIAnalytics(params: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalCalls: number;
    successRate: number;
    averageDuration: number;
    totalTokens: number;
    totalCost: number;
    callsByType: { [key: string]: number };
  }> {
    try {
      let query = this.supabase
        .from('ai_logs')
        .select('*');

      if (params.startDate) {
        query = query.gte('created_at', params.startDate.toISOString());
      }

      if (params.endDate) {
        query = query.lte('created_at', params.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error || !data) {
        console.error('[LoggingService] Failed to fetch AI analytics:', error);
        return {
          totalCalls: 0,
          successRate: 0,
          averageDuration: 0,
          totalTokens: 0,
          totalCost: 0,
          callsByType: {},
        };
      }

      const totalCalls = data.length;
      const successfulCalls = data.filter(log => log.status === 'success').length;
      const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
      
      const totalDuration = data.reduce((sum, log) => sum + (log.duration_ms || 0), 0);
      const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
      
      const totalTokens = data.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const totalCost = data.reduce((sum, log) => sum + (log.cost || 0), 0);

      const callsByType: { [key: string]: number } = {};
      data.forEach(log => {
        const type = log.operation_type || 'unknown';
        callsByType[type] = (callsByType[type] || 0) + 1;
      });

      return {
        totalCalls,
        successRate: Math.round(successRate * 100) / 100,
        averageDuration: Math.round(averageDuration),
        totalTokens,
        totalCost: Math.round(totalCost * 100) / 100,
        callsByType,
      };
    } catch (error) {
      console.error('[LoggingService] Exception while fetching AI analytics:', error);
      return {
        totalCalls: 0,
        successRate: 0,
        averageDuration: 0,
        totalTokens: 0,
        totalCost: 0,
        callsByType: {},
      };
    }
  }

  async getUserActivity(params: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    try {
      let query = this.supabase
        .from('learning_sessions')
        .select('*')
        .order('started_at', { ascending: false });

      if (params.userId) {
        query = query.eq('student_id', params.userId);
      }

      if (params.startDate) {
        query = query.gte('started_at', params.startDate.toISOString());
      }

      if (params.endDate) {
        query = query.lte('started_at', params.endDate.toISOString());
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[LoggingService] Failed to fetch user activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[LoggingService] Exception while fetching user activity:', error);
      return [];
    }
  }

  async getSystemHealth(): Promise<{
    totalUsers: number;
    activeUsersToday: number;
    totalAICalls: number;
    errorRate: number;
    averageResponseTime: number;
  }> {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [usersResult, activeUsersResult, aiLogsResult] = await Promise.all([
        this.supabase.from('users').select('id', { count: 'exact', head: true }),
        this.supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('last_login_at', todayStart.toISOString()),
        this.supabase.from('ai_logs').select('*'),
      ]);

      const totalUsers = usersResult.count || 0;
      const activeUsersToday = activeUsersResult.count || 0;
      const aiLogs = aiLogsResult.data || [];

      const totalAICalls = aiLogs.length;
      const failedCalls = aiLogs.filter(log => log.status === 'error').length;
      const errorRate = totalAICalls > 0 ? (failedCalls / totalAICalls) * 100 : 0;

      const totalDuration = aiLogs.reduce((sum, log) => sum + (log.duration_ms || 0), 0);
      const averageResponseTime = totalAICalls > 0 ? totalDuration / totalAICalls : 0;

      return {
        totalUsers,
        activeUsersToday,
        totalAICalls,
        errorRate: Math.round(errorRate * 100) / 100,
        averageResponseTime: Math.round(averageResponseTime),
      };
    } catch (error) {
      console.error('[LoggingService] Exception while fetching system health:', error);
      return {
        totalUsers: 0,
        activeUsersToday: 0,
        totalAICalls: 0,
        errorRate: 0,
        averageResponseTime: 0,
      };
    }
  }
}

export function createLoggingService(supabase: SupabaseClient): LoggingService {
  return new LoggingService(supabase);
}
