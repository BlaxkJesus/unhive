import { db, NotificationEntity, NotificationType } from './store.js';
import { broadcastVendorNotification } from './events.js';

export interface VendorEmailParams {
  vendorUserId: string;
  type: NotificationType;
  orderId: string;
  orderNumber: string;
  itemTitle: string;
  amount: number;
  hostelName: string;
  porterLodge: string;
  courierName?: string;
  courierPhone?: string;
  bankName?: string;
  accountNumber?: string;
  transferCode?: string;
  notes?: string;
}

export class NotificationService {
  /**
   * Generates and dispatches an automated transactional email to a campus merchant.
   * Also stores the notification for in-dashboard preview and emits real-time WebSocket alerts.
   */
  static sendVendorEmail(params: VendorEmailParams): NotificationEntity {
    const user = db.users.find((u) => u.id === params.vendorUserId);
    const vendorProfile = db.vendorProfiles.find((v) => v.userId === params.vendorUserId);
    const vendorEmail = user?.email || 'vendor@unihive.edu.ng';
    const vendorName = vendorProfile?.businessName || user?.fullName || 'Campus Merchant';

    let subject = '';
    let title = '';
    let statusThemeColor = '#0F2B5C';
    let badgeText = '';

    switch (params.type) {
      case 'in_transit':
        subject = `🚴 [UniHive] Order #${params.orderNumber} is on the way! Runner ${params.courierName || 'Courier'} picked up your package`;
        title = 'Courier Runner In Transit Across Campus';
        statusThemeColor = '#D97706'; // Amber
        badgeText = 'IN TRANSIT';
        break;

      case 'at_porter_desk':
        subject = `🏢 [UniHive] Order #${params.orderNumber} arrived at ${params.hostelName} Ground-Floor Porter Lodge`;
        title = 'Package Arrived at Reception Desk for Inspection';
        statusThemeColor = '#2563EB'; // Blue
        badgeText = 'AT PORTER DESK';
        break;

      case 'completed':
        subject = `💰 [UniHive Paystack] Payout Released! ₦${(params.amount ?? 0).toLocaleString()} credited to your ${params.bankName || 'OPay'} account for Order #${params.orderNumber}`;
        title = 'Atomic Dual Escrow Payout Released';
        statusThemeColor = '#059669'; // Emerald Green
        badgeText = 'PAYMENT SETTLED';
        break;

      case 'refunded':
        subject = `⚠️ [UniHive] Dispute Resolved: Order #${params.orderNumber} has been refunded to buyer`;
        title = 'Escrow Refund Executed by Chief Proctor';
        statusThemeColor = '#DC2626'; // Red
        badgeText = 'REFUNDED';
        break;

      default:
        subject = `📦 [UniHive] Order #${params.orderNumber} Update`;
        title = 'Order Status Update';
        badgeText = 'UPDATE';
    }

    const plainText = `
UniHive™ Campus Marketplace & Escrow Network
--------------------------------------------------
To: ${vendorName} (${vendorEmail})
Date: ${new Date().toUTCString()}
Subject: ${subject}
Status: ${badgeText}

Dear ${vendorName},

${
  params.type === 'in_transit'
    ? `Student runner ${params.courierName || 'David Adeleke'} (${params.courierPhone || '08098765432'}) has picked up your package and is in transit towards ${params.hostelName}.`
    : params.type === 'at_porter_desk'
    ? `Your package has arrived at ${params.porterLodge} (${params.hostelName}). The customer has been alerted to inspect the items at the ground floor reception before disclosing their 4-digit PIN.`
    : params.type === 'completed'
    ? `The buyer has physically inspected the item at ${params.porterLodge} and verified their 4-digit Handshake PIN. Paystack has atomically released ₦${(params.amount ?? 0).toLocaleString()} to your ${params.bankName || 'OPay'} account (${params.accountNumber || '8023456789'}). Transfer Reference: ${params.transferCode || 'TRF_VND_DIRECT'}.`
    : `Chief Proctor Adeleke reviewed the inspection dispute regarding Order #${params.orderNumber} and executed a 100% Paystack refund to the student buyer. Resolution Notes: ${params.notes || 'Inspection failure / incorrect item.'}`
}

ORDER SUMMARY:
• Order Number: #${params.orderNumber}
• Item: ${params.itemTitle}
• Merchant Vault Share: ₦${(params.amount ?? 0).toLocaleString()}
• Destination: ${params.hostelName} • ${params.porterLodge}
${params.courierName ? `• Assigned Courier: ${params.courierName}` : ''}
${params.transferCode ? `• Paystack Transfer Code: ${params.transferCode}` : ''}

Thank you for choosing UniHive for secure, zero-trust campus commerce.
Campus Proctorate & Security Division • Redeemer's University
    `.trim();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #0F172A; }
    .email-container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .header { background: #0F2B5C; padding: 24px 32px; color: #FFFFFF; text-align: center; }
    .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
    .brand span { color: #F59E0B; }
    .subbrand { font-size: 10px; font-weight: 700; color: #94A3B8; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; margin-top: 14px; background: ${statusThemeColor}; color: #FFFFFF; }
    .body { padding: 32px; }
    .title { font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; }
    .desc { font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 24px 0; }
    .order-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #F1F5F9; }
    .row:last-child { border-bottom: none; }
    .row-label { color: #64748B; font-weight: 600; }
    .row-value { color: #0F172A; font-weight: 700; }
    .payout-box { background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px; }
    .payout-amt { font-size: 24px; font-weight: 800; color: #065F46; margin: 4px 0; }
    .footer { background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 18px 32px; text-align: center; font-size: 11px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="brand">Uni<span>Hive</span>™</div>
      <div class="subbrand">Campus Merchant Escrow & Dispatch System</div>
      <div class="badge">${badgeText}</div>
    </div>
    <div class="body">
      <h2 class="title">${title}</h2>
      <p class="desc">
        Hello <strong>${vendorName}</strong>,<br><br>
        ${
          params.type === 'in_transit'
            ? `Runner <strong>${params.courierName || 'David Adeleke'}</strong> has picked up your package and is transporting it across campus to <strong>${params.hostelName}</strong>.`
            : params.type === 'at_porter_desk'
            ? `Your package has safely arrived at <strong>${params.porterLodge}</strong>. The buyer has been prompted to inspect the items before sharing their confidential Handshake PIN.`
            : params.type === 'completed'
            ? `Handshake PIN was successfully verified! Paystack has released <strong>₦${(params.amount ?? 0).toLocaleString()}</strong> to your <strong>${params.bankName || 'OPay'}</strong> account (<code>${params.accountNumber || '8023456789'}</code>).`
            : `The mediation for Order #${params.orderNumber} has ended. The Chief Proctor authorized a 100% Paystack refund to the buyer. Reason: <em>${params.notes || 'Physical inspection issue'}</em>.`
        }
      </p>

      ${
        params.type === 'completed'
          ? `
          <div class="payout-box">
            <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase;">Direct Payout Executed</div>
            <div class="payout-amt">+₦${(params.amount ?? 0).toLocaleString()}</div>
            <div style="font-size: 11px; color: #065F46;">Beneficiary: ${vendorName} • ${params.bankName || 'OPay'} (${params.accountNumber || '8023456789'})</div>
          </div>
          `
          : ''
      }

      <div class="order-box">
        <div class="row">
          <span class="row-label">Order Reference</span>
          <span class="row-value">#${params.orderNumber}</span>
        </div>
        <div class="row">
          <span class="row-label">Product Listed</span>
          <span class="row-value">${params.itemTitle}</span>
        </div>
        <div class="row">
          <span class="row-label">Vendor Vault Share</span>
          <span class="row-value" style="color: #059669;">₦${(params.amount ?? 0).toLocaleString()}</span>
        </div>
        <div class="row">
          <span class="row-label">Drop-off Destination</span>
          <span class="row-value">${params.hostelName} • ${params.porterLodge}</span>
        </div>
        ${
          params.courierName
            ? `
        <div class="row">
          <span class="row-label">Assigned Courier</span>
          <span class="row-value">${params.courierName} (${params.courierPhone || '08098765432'})</span>
        </div>
            `
            : ''
        }
        ${
          params.transferCode
            ? `
        <div class="row">
          <span class="row-label">Paystack Transfer Code</span>
          <span class="row-value"><code>${params.transferCode}</code></span>
        </div>
            `
            : ''
        }
      </div>

      <p style="font-size: 12px; color: #64748B; margin: 0; line-height: 1.4;">
        🔒 <strong>Zero-Room-Entry Campus Mandate:</strong> Deliveries are strictly restricted to ground-floor porter lodge desks. For inquiries, reach out to the campus proctorate.
      </p>
    </div>
    <div class="footer">
      © 2026 UniHive Inc. • Redeemer's University Flagship Station • Protected by 2FA TOTP & Paystack Escrow
    </div>
  </div>
</body>
</html>
    `.trim();

    const notification: NotificationEntity = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: params.vendorUserId,
      recipientEmail: vendorEmail,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      type: params.type,
      title,
      subject,
      htmlBody,
      textBody: plainText,
      targetRole: 'vendor',
      metadata: {
        amount: params.amount,
        bankName: params.bankName,
        accountNumber: params.accountNumber,
        transferCode: params.transferCode,
        hostelName: params.hostelName,
        porterLodge: params.porterLodge,
        courierName: params.courierName,
        notes: params.notes,
      },
      createdAt: new Date(),
      isRead: false,
    };

    db.notifications.push(notification);

    // Visual ASCII Terminal Log for Verification & Dev Visibility
    console.log(`
================================================================================
📧 [AUTOMATED EMAIL DISPATCHED]
--------------------------------------------------------------------------------
To:      ${vendorEmail} (${vendorName})
Subject: ${subject}
Order:   #${params.orderNumber}
Event:   ${badgeText} (${params.type})
Amount:  ₦${(params.amount ?? 0).toLocaleString()}
================================================================================
    `);

    // Broadcast live WebSocket event to vendor studio
    broadcastVendorNotification(params.vendorUserId, notification);

    return notification;
  }

  /**
   * Fetch all notifications for a given vendor user
   */
  static getVendorNotifications(vendorUserId: string): NotificationEntity[] {
    return db.notifications
      .filter((n) => n.userId === vendorUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Clears email notifications for a specific vendor or all vendors
   */
  static clearVendorNotifications(vendorUserId?: string): void {
    if (vendorUserId) {
      db.notifications = db.notifications.filter((n) => n.userId !== vendorUserId);
    } else {
      db.notifications = [];
    }
  }

  /**
   * Clears all in-memory email and transactional notifications across UniHive
   */
  static clearAllNotifications(): void {
    db.notifications = [];
  }

  /**
   * Dispatches an institutional email OTP verification code to a RUN student
   * to guarantee authentic matriculation and eliminate fake account creation.
   */
  static sendStudentVerificationOtp(params: {
    email: string;
    fullName?: string;
    matricNumber: string;
    code: string;
    campusName?: string;
  }): NotificationEntity {
    const campus = "Redeemer's University (Ede)";
    const studentName = params.fullName || "Redeemer's University Student";
    const campusTag = 'RUN';
    const subject = `🎓 [UniHive Security] Your 6-Digit RUN Verification Code: ${params.code}`;
    const title = 'Institutional Identity Verification (Anti-Impersonation)';

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: #0F2B5C; padding: 24px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Uni<span style="color: #F59E0B;">Hive</span>™</h1>
          <p style="color: #93C5FD; margin: 6px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">${campus} • Security Desk</p>
        </div>

        <div style="padding: 30px;">
          <h2 style="color: #0F172A; font-size: 18px; margin: 0 0 12px 0;">Official Identity Verification</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>${studentName}</strong>,
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            You are registering for the <strong>UniHive Connected Campus Marketplace</strong> at <strong>${campus}</strong> with matriculation number <strong>${params.matricNumber}</strong>.
          </p>
          <p style="color: #475569; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
            To protect our campus community and prevent impersonation, please enter your confidential 6-digit verification code below:
          </p>

          <div style="background: #EFF6FF; border: 2px dashed #3B82F6; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="font-size: 11px; font-weight: 800; color: #1E40AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Your 6-Digit Email Code</div>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0F2B5C; font-family: monospace;">${params.code}</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 6px;">Valid for 10 minutes • Do NOT disclose to anyone</div>
          </div>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; margin-top: 24px;">
            <div style="font-size: 12px; font-weight: 700; color: #0F2B5C; margin-bottom: 4px;">🛡️ Zero-Room-Entry & Safe Escrow Mandate</div>
            <div style="font-size: 11px; color: #64748B; line-height: 1.5;">
              All UniHive campus deliveries terminate at your ground-floor hostel porter lodge. Never pay cash upfront—inspect your item in person before providing your 4-digit buyer handshake PIN.
            </div>
          </div>
        </div>

        <div style="background: #F1F5F9; padding: 16px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0; font-size: 11px; color: #64748B;">© 2026 UniHive Campus Dispatch & Escrow Network. ${campus} Flagship Node.</p>
        </div>
      </div>
    `;

    const plainText = `
UniHive™ Institutional Identity Verification
--------------------------------------------------
To: ${studentName} (${params.email})
Matriculation No: ${params.matricNumber}
Campus: ${campus}
Date: ${new Date().toUTCString()}

Your 6-Digit Verification Code: [ ${params.code} ]

Enter this code into your UniHive app to complete student registration.
This code expires in 10 minutes.
    `;

    const notification: NotificationEntity = {
      id: `notif-otp-${Date.now()}`,
      userId: `pending-${params.email}`,
      recipientEmail: params.email,
      type: 'general',
      title,
      subject,
      htmlBody,
      textBody: plainText,
      targetRole: 'buyer',
      metadata: {
        code: params.code,
        matricNumber: params.matricNumber,
        email: params.email,
      },
      createdAt: new Date(),
      isRead: false,
    };

    db.notifications.push(notification);

    console.log(`
================================================================================
📧 [INSTITUTIONAL EMAIL OTP DISPATCHED]
--------------------------------------------------------------------------------
To:      ${params.email} (${studentName})
Subject: ${subject}
Matric:  ${params.matricNumber}
Code:    [ ${params.code} ] (Expires in 10 mins)
Campus:  ${campus}
================================================================================
    `);

    return notification;
  }
}
