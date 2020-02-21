export const SECTIONS = [
  { label: 'Betting', settings: [{ field: 'bet' }] },
  {
    label: 'Notifications',
    settings: [
      { field: 'email', label: 'Email Notifications' },
      { field: 'desktop', label: 'Desktop Notifications' },
      { field: 'mobile', label: 'Mobile Notifications' }
    ]
  }
];

export const SETTING_DETAILS = {
  email: {
    personal: {
      label: 'Replies, mentions and earnings',
      description:
        'Get notified when you earn rewards, someone replies to your comments or mentions you in a post.'
    },
    general: {
      label: 'General notifications',
      description:
        'Get notified about new posts and comments on posts you have interacted with.'
    },
    digest: {
      label: 'Email digest',
      description:
        'Receive periodic emails with the top posts from your favorite communities.'
    }
  },
  mobile: {
    all: {
      label: 'Mobile notifications',
      description: 'Receive mobile app notifications for any community activity.'
    }
  },
  desktop: {
    all: {
      label: 'Desktop notifications',
      description: 'Receive notifications in a browser for any community activity.'
    }
  },
  bet: {
    manual: {
      label: 'Betting Mode',
      description: 'Betting mode allows you to choose a custom amount for each bet.'
    }
  }
};
