import type { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export function setSocketIO(io: SocketIOServer) {
  ioInstance = io;
}

export function getSocketIO(): SocketIOServer | null {
  return ioInstance;
}

export function broadcastOrderStatus(orderNumber: string, status: string, payload?: any) {
  if (ioInstance) {
    const eventData = {
      orderNumber,
      status,
      timestamp: new Date().toISOString(),
      payload,
    };
    // Emit globally once so all subscribers (order rooms and notification engines) receive exactly one event
    ioInstance.emit('order:status_changed', eventData);

    if (status === 'item_picked_up') {
      ioInstance.emit('order:item_picked_up', payload || eventData);
    }
    console.log(`[RealTime] Broadcasted order:status_changed -> ${orderNumber}: ${status}`);
  }
}

export function broadcastCampusDispatch(campusSlug: string, event: string, payload?: any) {
  if (ioInstance) {
    const eventData = {
      campusSlug,
      campusId: campusSlug,
      timestamp: new Date().toISOString(),
      payload,
    };
    // Broadcast campus dispatch event once across connected fleet
    ioInstance.emit(event, eventData);
    console.log(`[RealTime] Broadcasted campus event ${event} -> ${campusSlug}`);
  }
}

export function broadcastAdminAlert(event: string, payload?: any) {
  if (ioInstance) {
    const eventData = {
      timestamp: new Date().toISOString(),
      payload,
    };
    ioInstance.emit(event, eventData);
    console.log(`[RealTime] Broadcasted admin alert -> ${event}`);
  }
}

export function broadcastVendorNotification(vendorUserId: string, notification: any) {
  if (ioInstance) {
    ioInstance.emit('vendor:new_notification', {
      vendorUserId,
      notification,
      timestamp: new Date().toISOString(),
    });
    console.log(`[RealTime] Broadcasted vendor notification -> ${vendorUserId}`);
  }
}
