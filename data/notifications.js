
export const staticNotifications = [
    {
      id: 1,
      sender: "Dexter",
      message: "You have upcoming activities due next week",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: 2,
      sender: "Alice",
      message: "Accepted your request",
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: 3,
      sender: "Charlie",
      message: "Weekly report is ready",
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ];
  