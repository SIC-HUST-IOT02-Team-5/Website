import { useState, useEffect } from 'react';

const MQTTStatus = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    // Simulate MQTT connection status checking
    // In a real implementation, you would check actual MQTT connection status
    const checkMQTTStatus = () => {
      // This would be replaced with actual MQTT status check
      const isConnected = Math.random() > 0.1; // 90% chance of being connected
      setStatus(isConnected ? 'connected' : 'disconnected');
      setLastCheck(new Date());
    };

    // Initial check
    setTimeout(checkMQTTStatus, 2000);

    // Check status every 30 seconds
    const interval = setInterval(checkMQTTStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          gradient: 'linear-gradient(135deg, #10B981, #059669)',
          borderColor: '#10B981',
          text: 'MQTT Connected',
          icon: '🟢',
          pulse: false
        };
      case 'disconnected':
        return {
          gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
          borderColor: '#EF4444',
          text: 'MQTT Disconnected',
          icon: '🔴',
          pulse: true
        };
      case 'connecting':
        return {
          gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
          borderColor: '#F59E0B',
          text: 'MQTT Connecting...',
          icon: '🟡',
          pulse: true
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 16px',
      background: statusInfo.gradient,
      color: 'white',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      border: `2px solid ${statusInfo.borderColor}`,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      animation: statusInfo.pulse ? 'pulse 2s infinite' : 'none'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.1)',
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ 
          fontSize: '14px',
          animation: status === 'connecting' ? 'bounce 1s infinite' : 'none'
        }}>
          {statusInfo.icon}
        </span>
        <span>{statusInfo.text}</span>
        
        {status === 'connected' && (
          <div style={{
            fontSize: '10px',
            opacity: 0.8,
            marginLeft: '4px'
          }}>
            {lastCheck.toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-3px);
            }
            60% {
              transform: translateY(-1px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default MQTTStatus;
