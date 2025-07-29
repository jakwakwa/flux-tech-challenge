// lib/config.ts
interface Config {
  // Database
  database: {
    url: string;
  };
  
  // Authentication
  auth: {
    clerkPublishableKey: string;
    clerkSecretKey: string;
  };
  
  // Application
  app: {
    name: string;
    description: string;
    url: string;
    environment: 'development' | 'production' | 'test';
  };
  
  // Limits
  limits: {
    maxListsPerUser: number;
    maxTasksPerList: number;
    maxTitleLength: number;
    maxDescriptionLength: number;
  };
  
  // Cache
  cache: {
    defaultTTL: number;
    userStatsTTL: number;
  };
}

const config: Config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  auth: {
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  },
  
  app: {
    name: 'Flux Todo App',
    description: 'A simple and intuitive todo list application to organize your tasks and boost productivity.',
    url: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: (process.env.NODE_ENV as Config['app']['environment']) || 'development',
  },
  
  limits: {
    maxListsPerUser: parseInt(process.env.MAX_LISTS_PER_USER || '10'),
    maxTasksPerList: parseInt(process.env.MAX_TASKS_PER_LIST || '100'),
    maxTitleLength: parseInt(process.env.MAX_TITLE_LENGTH || '100'),
    maxDescriptionLength: parseInt(process.env.MAX_DESCRIPTION_LENGTH || '500'),
  },
  
  cache: {
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300000'), // 5 minutes
    userStatsTTL: parseInt(process.env.CACHE_USER_STATS_TTL || '60000'), // 1 minute
  },
};

// Validation
const validateConfig = () => {
  const requiredFields = [
    'database.url',
    'auth.clerkPublishableKey',
    'auth.clerkSecretKey',
  ];

  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj: any, key) => obj?.[key], config);
    if (!value) {
      throw new Error(`Missing required configuration: ${field}`);
    }
  }
};

// Validate in non-test environments
if (config.app.environment !== 'test') {
  validateConfig();
}

export default config;