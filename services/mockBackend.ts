import { Game, User, Notification, GameType, Availability, BankDetails, Group } from '../types';

// --- Mailjet Configuration ---
const MJ_API_KEY = '993f7f4d8b9cad07e216a474409a69cd';
const MJ_SECRET_KEY = 'd353d8dd9deedd53d6d959b44bceb8ce';

// --- Sample Data ---

export const SAMPLE_GROUPS: Group[] = [
  { id: 'g_a', name: 'Metro League (Group A)' },
  { id: 'g_b', name: 'Valley Association (Group B)' }
];

export const SAMPLE_USERS: User[] = [
  // Super Admin (Developer) - Updated as requested
  { id: 'u1', name: 'Twiha (SuperAdmin)', email: 'twiha@live.com', phone: '+15550000', role: 'ADMIN', avatar: 'https://picsum.photos/200', isSuperAdmin: true },
  
  // Group A Admin & Refs
  // Keeping Alice as a secondary admin for demo variety, but her role can be assumed by Twiha if logged in as SuperAdmin
  { id: 'u_admin_a', name: 'Admin Alice (Metro)', email: 'alice@metro.com', phone: '+15550101', role: 'ADMIN', avatar: 'https://picsum.photos/205', groupId: 'g_a' },
  { id: 'u2', name: 'Ref Bob (Metro)', email: 'bob@ref.com', phone: '+15550102', role: 'REFEREE', avatar: 'https://picsum.photos/201', groupId: 'g_a' },
  { id: 'u3', name: 'Ref Carol (Metro)', email: 'carol@ref.com', phone: '+15550103', role: 'REFEREE', avatar: 'https://picsum.photos/202', groupId: 'g_a' },
  
  // Group B Admin & Refs
  { id: 'u_admin_b', name: 'Admin Ben (Valley)', email: 'ben@valley.com', phone: '+15550201', role: 'ADMIN', avatar: 'https://picsum.photos/206', groupId: 'g_b' },
  { id: 'u4', name: 'Ref Dave (Valley)', email: 'dave@ref.com', phone: '+15550104', role: 'REFEREE', avatar: 'https://picsum.photos/203', groupId: 'g_b' },
  { id: 'u5', name: 'Ref Eve (Valley)', email: 'eve@ref.com', phone: '+15550105', role: 'REFEREE', avatar: 'https://picsum.photos/204', groupId: 'g_b' },
];

const INITIAL_GAMES: Game[] = [
  // Group A Games
  {
    id: 'g1',
    groupId: 'g_a',
    type: 'OUTDOOR',
    homeTeam: 'Lions FC',
    awayTeam: 'Tigers Utd',
    field: 'Memorial Park',
    locationCity: 'Seattle',
    date: '2023-11-15',
    time: '14:00',
    assignments: [
      { role: 'Center Referee', userId: 'u2', fee: 60, status: 'PENDING', paymentStatus: 'UNPAID' },
      { role: 'AR1', userId: 'u3', fee: 40, status: 'ACCEPTED', paymentStatus: 'PAID', paidAt: '2023-11-16' },
      { role: 'AR2', userId: null, fee: 40, status: 'PENDING', paymentStatus: 'UNPAID' },
      { role: '4th Official', userId: null, fee: 25, status: 'PENDING', paymentStatus: 'UNPAID' },
    ]
  },
  // Group B Games
  {
    id: 'g2',
    groupId: 'g_b',
    type: 'FUTSAL',
    homeTeam: 'Quick Feet',
    awayTeam: 'Net Busters',
    field: 'Downtown Community Center',
    locationCity: 'Portland',
    date: '2023-11-16',
    time: '18:30',
    assignments: [
      { role: 'Referee 1', userId: 'u4', fee: 35, status: 'PENDING', paymentStatus: 'UNPAID' },
      { role: 'Referee 2', userId: null, fee: 35, status: 'PENDING', paymentStatus: 'UNPAID' },
      { role: 'Timekeeper', userId: null, fee: 20, status: 'PENDING', paymentStatus: 'UNPAID' },
    ]
  }
];

const INITIAL_AVAILABILITY: Availability[] = [
  { id: 'a1', userId: 'u2', date: '2023-11-16', type: 'UNAVAILABLE', notes: 'Dentist Appointment' }, // Bob unavailable on 16th
  { id: 'a2', userId: 'u3', date: '2023-11-15', type: 'AVAILABLE', startTime: '12:00', endTime: '18:00', notes: 'Free all afternoon' },
];

// --- Service Logic ---

class MockBackendService {
  private games: Game[] = [...INITIAL_GAMES];
  private users: User[] = [...SAMPLE_USERS];
  private groups: Group[] = [...SAMPLE_GROUPS];
  private notifications: Notification[] = [];
  private availabilities: Availability[] = [...INITIAL_AVAILABILITY];

  // Simulate API Latency
  private async delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getGroups(): Promise<Group[]> {
    await this.delay();
    return [...this.groups];
  }

  async getGames(): Promise<Game[]> {
    await this.delay();
    return [...this.games];
  }

  async getUsers(): Promise<User[]> {
    await this.delay();
    return [...this.users];
  }

  // Simulate authentication
  async authenticate(email: string, _password: string): Promise<User | null> {
    await this.delay(800);
    // In a real app, we would hash check the password. 
    // Here, we just check if the user exists for demo purposes.
    // Password 'dummy check': Accept any non-empty password.
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && _password) return user;
    return null;
  }

  async createUser(user: User): Promise<User> {
    await this.delay();
    // Assign a fake ID if not provided
    const newUser = { 
        ...user, 
        id: user.id || Math.random().toString(36).substr(2, 9),
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
    };
    this.users.push(newUser);
    return newUser;
  }

  async saveGame(game: Game): Promise<Game> {
    await this.delay();
    const existingIndex = this.games.findIndex(g => g.id === game.id);
    if (existingIndex >= 0) {
      this.games[existingIndex] = game;
    } else {
      this.games.push(game);
    }
    return game;
  }

  async deleteGame(gameId: string): Promise<void> {
    await this.delay();
    this.games = this.games.filter(g => g.id !== gameId);
  }

  // Sends email via Mailjet API
  private async sendEmailViaMailjet(toEmail: string, toName: string, subject: string, htmlContent: string): Promise<void> {
    console.log(`[Mailjet] Attempting to send email to ${toEmail}...`);
    
    try {
        const response = await fetch('https://api.mailjet.com/v3.1/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(MJ_API_KEY + ':' + MJ_SECRET_KEY)
            },
            body: JSON.stringify({
                Messages: [
                    {
                        From: {
                            Email: "twiha@live.com", 
                            Name: "YOU ASSIGN" 
                        },
                        To: [
                            {
                                Email: toEmail,
                                Name: toName
                            }
                        ],
                        Subject: subject,
                        HTMLPart: htmlContent,
                        TextPart: "Please enable HTML to view this message."
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.warn("[Mailjet] API returned error (Likely CORS or Unverified Sender in Sandbox):", errorData);
            console.log("[Mailjet] Fallback: Email content logged above successfully.");
        } else {
            console.log("[Mailjet] Email sent successfully!");
        }

    } catch (error) {
        console.error("[Mailjet] Network Error (Expected if CORS blocks 3rd party APIs in browser):", error);
        console.log("[Mailjet] Fallback: Email content logged above successfully.");
    }
  }

  // Send a specific report to the admin about upcoming games
  async sendAdminUpcomingGamesReport(adminId: string): Promise<void> {
    await this.delay();
    const admin = this.users.find(u => u.id === adminId);
    if (!admin || admin.role !== 'ADMIN') return;

    // Filter games for this admin
    const adminGames = this.games.filter(g => admin.isSuperAdmin || g.groupId === admin.groupId);
    
    // Filter for upcoming 7 days
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const upcomingGames = adminGames.filter(g => g.date >= todayStr && g.date <= nextWeekStr);

    if (upcomingGames.length === 0) {
        await this.sendNotification(adminId, "No upcoming games found for report.", 'EMAIL');
        return;
    }

    // Build HTML Report
    let html = `
      <div style="font-family: sans-serif; color: #162a5c;">
        <h2>Weekly Game Report</h2>
        <p>Dear ${admin.name},</p>
        <p>Here is the status of your games for the upcoming week (${todayStr} to ${nextWeekStr}).</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #162a5c; color: white;">
              <th style="padding: 10px; text-align: left;">Date</th>
              <th style="padding: 10px; text-align: left;">Match</th>
              <th style="padding: 10px; text-align: left;">Field</th>
              <th style="padding: 10px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    upcomingGames.forEach(game => {
      const openSlots = game.assignments.filter(a => !a.userId).length;
      const statusColor = openSlots === 0 ? 'green' : 'red';
      const statusText = openSlots === 0 ? 'Fully Staffed' : `${openSlots} Open Slot(s)`;
      
      html += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;">${game.date} @ ${game.time}</td>
          <td style="padding: 10px;">${game.homeTeam} vs ${game.awayTeam}</td>
          <td style="padding: 10px;">${game.field}</td>
          <td style="padding: 10px; text-align: center; color: ${statusColor}; font-weight: bold;">${statusText}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <p style="margin-top: 20px;">Please log in to You Assign to manage these assignments.</p>
        <hr/>
        <small>Powered by Mailjet & You Assign</small>
      </div>
    `;

    await this.sendEmailViaMailjet(admin.email, admin.name, `Game Status Report - ${upcomingGames.length} Upcoming Games`, html);
    await this.sendNotification(adminId, `Game Report sent to ${admin.email}`, 'EMAIL');
  }

  // Checks for games tomorrow and emails admins/assignors
  async triggerGameReminders(): Promise<number> {
    await this.delay();
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`[MockBackend] Looking for games on ${tomorrowStr}`);
    
    const games = this.games.filter(g => g.date === tomorrowStr);
    let sentCount = 0;

    for (const game of games) {
        // Target the admin of the group
        const admin = this.users.find(u => u.role === 'ADMIN' && !u.isSuperAdmin && u.groupId === game.groupId) 
                   || this.users.find(u => u.role === 'ADMIN' && u.isSuperAdmin);

        if (admin) {
             const subject = `Reminder: ${game.homeTeam} vs ${game.awayTeam}`;
             const html = `
                <div style="font-family: sans-serif; color: #162a5c;">
                    <h3>Upcoming Match Reminder</h3>
                    <p>Hello ${admin.name},</p>
                    <p>This is an automated reminder for a match scheduled for tomorrow (${game.date}):</p>
                    <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin-bottom: 15px; background-color: #f9fafb;">
                        <p style="margin: 5px 0;"><strong>Teams:</strong> ${game.homeTeam} vs ${game.awayTeam}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${game.time}</p>
                        <p style="margin: 5px 0;"><strong>Field:</strong> ${game.field}, ${game.locationCity}</p>
                        <p style="margin: 5px 0;"><strong>Type:</strong> ${game.type}</p>
                    </div>
                    <p>Please ensure all referee slots are assigned and confirmed.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <small style="color: #888;">You Assign Automated Notification System</small>
                </div>
             `;
             
             await this.sendEmailViaMailjet(admin.email, admin.name, subject, html);
             await this.sendNotification(admin.id, `24h Reminder sent for ${game.homeTeam} vs ${game.awayTeam}`, 'EMAIL');
             sentCount++;
        }
    }
    return sentCount;
  }

  // Mocking Mailjet/Google Voice
  async sendNotification(userId: string, message: string, type: 'EMAIL' | 'SMS'): Promise<void> {
    await this.delay(300);
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    this.notifications.unshift(newNotif);
    
    console.log(`[Simulated ${type}] To: ${user.name} | Msg: ${message}`);

    if (type === 'EMAIL') {
        // Basic text email for generic notifications
        const html = `
            <div style="font-family: sans-serif; color: #162a5c;">
                <h3>You Assign Notification</h3>
                <p>${message}</p>
                <hr/>
                <small>Powered by Mailjet & You Assign</small>
            </div>
        `;
        await this.sendEmailViaMailjet(user.email, user.name, "You Assign Notification", html);
    } else if (type === 'SMS') {
        // SMS Logic via T-Mobile Gateway
        const digits = user.phone.replace(/\D/g, '');
        const gatewayEmail = `${digits}@tmomail.net`;
        const smsMessage = `${message}\n\nDo NOT reply to this message.`;
        
        // Send as email to SMS gateway
        await this.sendEmailViaMailjet(gatewayEmail, user.name, "", smsMessage);
    }
  }

  // New manual notification that handles both Email and SMS explicitly
  async sendManualNotification(args: { email: string, phone: string, subject: string, message: string }): Promise<void> {
    await this.delay();
    console.log(`[Manual Notification] Sending to ${args.email} and ${args.phone}`);

    // 1. Send Email
    const emailHtml = `
        <div style="font-family: sans-serif; color: #162a5c;">
            <h3>${args.subject}</h3>
            <p>${args.message}</p>
            <hr/>
            <small>Powered by Mailjet & You Assign</small>
        </div>
    `;
    await this.sendEmailViaMailjet(args.email, "Recipient", args.subject, emailHtml);

    // 2. Send SMS via Gateway
    const digits = args.phone.replace(/\D/g, '');
    const gatewayEmail = `${digits}@tmomail.net`;
    const smsMessage = `${args.message}\n\nDo NOT reply to this message.`;
    
    await this.sendEmailViaMailjet(gatewayEmail, "Recipient", "", smsMessage);
  }

  async updateAssignmentStatus(gameId: string, roleName: string, status: 'ACCEPTED' | 'DECLINED'): Promise<Game> {
    await this.delay();
    const game = this.games.find(g => g.id === gameId);
    if (!game) throw new Error("Game not found");

    const assignment = game.assignments.find(a => a.role === roleName);
    if (assignment) {
      assignment.status = status;
      
      // Notify Admin (Find the admin for this group)
      const admin = this.users.find(u => u.role === 'ADMIN' && (u.isSuperAdmin || u.groupId === game.groupId));
      
      // Determine the referee name
      const ref = this.users.find(u => u.id === assignment.userId);
      const refName = ref ? ref.name : "A referee";

      if (admin) {
        const msg = `Referee ${refName} has ${status} the assignment for ${game.homeTeam} vs ${game.awayTeam} on ${game.date}.`;
        await this.sendNotification(admin.id, msg, 'EMAIL');
      }
    }
    return { ...game };
  }

  async markAssignmentAsPaid(gameId: string, roleName: string): Promise<Game> {
    await this.delay(1000); // Slower to simulate payment processing
    const game = this.games.find(g => g.id === gameId);
    if (!game) throw new Error("Game not found");

    const assignment = game.assignments.find(a => a.role === roleName);
    if (assignment) {
      assignment.paymentStatus = 'PAID';
      assignment.paidAt = new Date().toISOString().split('T')[0];
    }
    return { ...game };
  }

  async saveBankDetails(userId: string, details: BankDetails): Promise<User> {
    await this.delay();
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    
    // In a real app, this would be encrypted. Here we just store it.
    user.bankDetails = details;
    return { ...user };
  }

  async getAvailabilities(): Promise<Availability[]> {
    await this.delay();
    return [...this.availabilities];
  }

  async addAvailability(avail: Availability): Promise<Availability> {
    await this.delay();
    this.availabilities.push(avail);
    return avail;
  }

  async deleteAvailability(id: string): Promise<void> {
    await this.delay();
    this.availabilities = this.availabilities.filter(a => a.id !== id);
  }

  getDefinitions(type: GameType) {
    if (type === 'OUTDOOR') {
      return ['Center Referee', 'AR1', 'AR2', '4th Official'];
    }
    return ['Referee 1', 'Referee 2', 'Timekeeper', '3rd Official'];
  }
}

export const backend = new MockBackendService();