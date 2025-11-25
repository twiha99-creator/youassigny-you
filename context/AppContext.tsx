import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Game, Notification, Availability, BankDetails, Group, UserRole } from '../types';

// ✅ IMPORTANT — use the REAL backend instead of mock backend
import { backend } from '../services/apiBackend';

interface AppContextType {
  currentUser: User | null;
  games: Game[];
  users: User[];
  groups: Group[];
  notifications: Notification[];
  availabilities: Availability[];
  isLoading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  authenticate: (email: string, pass: string) => Promise<User | null>;
  register: (name: string, email: string, phone: string, role: UserRole, groupId?: string) => Promise<void>;
  refreshGames: () => Promise<void>;
  updateGame: (game: Game) => Promise<void>;
  respondToAssignment: (gameId: string, role: string, status: 'ACCEPTED' | 'DECLINED') => Promise<void>;
  triggerNotification: (msg: string, type: 'EMAIL' | 'SMS') => void;
  addAvailability: (avail: Omit<Availability, 'id'>) => Promise<void>;
  deleteAvailability: (id: string) => Promise<void>;
  markAsPaid: (gameId: string, role: string) => Promise<void>;
  updateBankDetails: (details: { accountHolder: string, bankName: string, routingNumber: string, accountNumber: string }) => Promise<void>;
  createReferee: (name: string, email: string, phone: string, groupId?: string) => Promise<void>;
  sendAdminReport: () => Promise<void>;
  triggerGameReminders: () => Promise<number>;
  sendManualNotification: (args: { email: string, phone: string, subject: string, message: string }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial load
  useEffect(() => {
    refreshData();
  }, []);

  // Whenever currentUser changes, filter the view
  useEffect(() => {
    if (currentUser) {
       refreshData();
    } else {
        setGames([]);
        setUsers([]);
    }
  }, [currentUser]);

  const refreshData = async () => {
    setIsLoading(true);
    const [allGames, allUsers, allAvail, allGroups] = await Promise.all([
      backend.getGames(), 
      backend.getUsers(),
      backend.getAvailabilities(),
      backend.getGroups()
    ]);

    setGroups(allGroups);
    setAvailabilities(allAvail);

    // Logic: Filter based on currentUser permissions
    if (!currentUser) {
        setGames([]);
        setUsers([]);
    } else if (currentUser.isSuperAdmin) {
        setGames(allGames);
        setUsers(allUsers);
    } else if (currentUser.role === 'ADMIN') {
        setGames(allGames.filter(g => g.groupId === currentUser.groupId));
        setUsers(allUsers.filter(u => u.groupId === currentUser.groupId || u.id === currentUser.id));
    } else {
        const myGames = allGames.filter(g => g.assignments?.some(a => a.userId === currentUser.id));
        setGames(myGames);
        setUsers([currentUser]);
    }
    setIsLoading(false);
  };

  const login = (userId: string) => {
    backend.getUsers().then(latestUsers => {
        const user = latestUsers.find(u => u.id === userId);
        setCurrentUser(user || null);
    });
  };

  const authenticate = async (email: string, pass: string) => {
    setIsLoading(true);
   const { user, token } = await backend.authenticate(email, pass);

// Store token for API Authorization
localStorage.setItem("token", token);
backend.setToken(token);


// Store token for API Authorization
localStorage

    if (user) {
        setCurrentUser(user);
    }
    setIsLoading(false);
    return user;
  };

  const register = async (name: string, email: string, phone: string, role: UserRole, groupId?: string) => {
    setIsLoading(true);
    const newUser = await backend.createUser({
        id: '',
        name,
        email,
        phone,
        role,
        groupId,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });
    setCurrentUser(newUser);
    setIsLoading(false);
  };

  const logout = () => setCurrentUser(null);

  const refreshGames = async () => {
    await refreshData();
  };

  const refreshUsers = async () => {
    await refreshData();
  };

  const updateGame = async (game: Game) => {
    setIsLoading(true);

    const oldGame = games.find(g => g.id === game.id);

    await backend.saveGame(game);

    game.assignments?.forEach(async (newAssign, index) => {
      const oldAssign = oldGame?.assignments?.[index];
      const wasUnassigned = !oldAssign?.userId;
      const isDifferentUser = oldAssign?.userId !== newAssign.userId;

      if (newAssign.userId && (wasUnassigned || isDifferentUser) && newAssign.status === 'PENDING') {
        const emailMsg = `You have been assigned to a new game!\n\nMatch: ${game.homeTeam} vs ${game.awayTeam}\nDate: ${game.date}\nTime: ${game.time}\nField: ${game.field}`;
        await backend.sendNotification(newAssign.userId, emailMsg, 'EMAIL');

        const smsMsg = `You Assign: New Game ${game.date} @ ${game.time}. ${game.homeTeam} vs ${game.awayTeam}. Log in to accept.`;
        await backend.sendNotification(newAssign.userId, smsMsg, 'SMS');
      }
    });

    await refreshGames();
  };

  const createReferee = async (name: string, email: string, phone: string, groupId?: string) => {
     if (!currentUser) return;
     setIsLoading(true);

     const targetGroup = currentUser.isSuperAdmin ? groupId : currentUser.groupId;

     const newRef: User = {
         id: '',
         name,
         email,
         phone,
         role: 'REFEREE',
         groupId: targetGroup,
         avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
     };

     await backend.createUser(newRef);
     await refreshData();
     setIsLoading(false);
     triggerNotification(`Referee account created for ${name}`, 'EMAIL');
  };

  const respondToAssignment = async (gameId: string, role: string, status: 'ACCEPTED' | 'DECLINED') => {
    setIsLoading(true);
    await backend.updateAssignmentStatus(gameId, role, status);
    await refreshGames();
  };

  const markAsPaid = async (gameId: string, role: string) => {
    setIsLoading(true);
    await backend.markAssignmentAsPaid(gameId, role);
    await refreshGames();
    setIsLoading(false);
  };

  const updateBankDetails = async (details: { accountHolder: string, bankName: string, routingNumber: string, accountNumber: string }) => {
    if (!currentUser) return;
    setIsLoading(true);

    const bankDetails: BankDetails = {
        accountHolder: details.accountHolder,
        bankName: details.bankName,
        routingNumber: details.routingNumber,
        accountNumberMasked: `****${details.accountNumber.slice(-4)}`
    };

    await backend.saveBankDetails(currentUser.id, bankDetails);
    await refreshUsers();
    triggerNotification("Direct Deposit information updated securely.", "EMAIL");
    setIsLoading(false);
  };

  const triggerNotification = (msg: string, type: 'EMAIL' | 'SMS') => {
     const notif: Notification = {
        id: Math.random().toString(),
        userId: currentUser?.id || 'unknown',
        message: msg,
        type,
        timestamp: Date.now(),
        read: false
     };
     setNotifications(prev => [notif, ...prev]);
  };

  const sendAdminReport = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    await backend.sendAdminUpcomingGamesReport(currentUser.id);
    triggerNotification("Game Report sent to your email.", "EMAIL");
    setIsLoading(false);
  };

  const triggerGameReminders = async () => {
    if (!currentUser) return 0;
    setIsLoading(true);
    const count = await backend.triggerGameReminders();
    if (count > 0) {
        triggerNotification(`Sent ${count} game reminders successfully.`, "EMAIL");
    } else {
        triggerNotification("No games found scheduled for tomorrow.", "SMS");
    }
    setIsLoading(false);
    return count;
  };

  const sendManualNotification = async (args: { email: string, phone: string, subject: string, message: string }) => {
    setIsLoading(true);
    await backend.sendManualNotification(args);
    triggerNotification(`Manual notification sent to ${args.email}`, 'EMAIL');
    setIsLoading(false);
  };

  const addAvailability = async (avail: Omit<Availability, 'id'>) => {
    setIsLoading(true);
    const newAvail: Availability = { ...avail, id: Date.now().toString() };
    await backend.addAvailability(newAvail);
    await refreshData();
    setIsLoading(false);
  };

  const deleteAvailability = async (id: string) => {
    setIsLoading(true);
    await backend.deleteAvailability(id);
    await refreshData();
    setIsLoading(false);
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, games, users, groups, notifications, availabilities, isLoading, 
      login, logout, authenticate, register, refreshGames, updateGame, respondToAssignment, triggerNotification,
      addAvailability, deleteAvailability, markAsPaid, updateBankDetails, createReferee, sendAdminReport, triggerGameReminders,
      sendManualNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
