// Simple analytics tracking system
// In production, integrate with Google Analytics, Mixpanel, or Amplitude

class Analytics {
  static track(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }

    // In production, send to analytics service
    // Example: analytics.track(eventName, properties);
    
    // Store locally for now
    this.storeEvent(event);
  }

  static getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  static storeEvent(event) {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push(event);
      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }

  static getEvents() {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  // Specific tracking methods
  static trackPageView(pageName) {
    this.track('page_view', { page: pageName });
  }

  static trackAppBuildStart(prompt) {
    this.track('app_build_start', {
      prompt_length: prompt.length,
      has_target_country: prompt.toLowerCase().includes('india') || 
                         prompt.toLowerCase().includes('usa') ||
                         prompt.toLowerCase().includes('uk')
    });
  }

  static trackAppBuildComplete(data) {
    this.track('app_build_complete', {
      files_generated: data.files_generated,
      lines_of_code: data.lines_of_code,
      qa_score: data.qa_results?.overall_score,
      deployment_ready: data.deployment_ready,
      time_taken: data.time_taken_seconds
    });
  }

  static trackCodeDownload(projectName) {
    this.track('code_download', {
      project_name: projectName,
      download_timestamp: Date.now()
    });
  }

  static trackDeploymentStart(provider) {
    this.track('deployment_start', {
      provider,
      timestamp: Date.now()
    });
  }

  static trackError(error, context) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  static trackUpgradeClick(fromTier, toTier) {
    this.track('upgrade_click', {
      from_tier: fromTier,
      to_tier: toTier
    });
  }

  // Get analytics summary
  static getSummary() {
    const events = this.getEvents();
    return {
      total_events: events.length,
      event_types: [...new Set(events.map(e => e.name))],
      session_id: this.getSessionId(),
      first_event: events[0]?.timestamp,
      last_event: events[events.length - 1]?.timestamp
    };
  }
}

export default Analytics;