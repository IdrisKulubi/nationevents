/**
 * Environment Variables Validation
 * Validates required environment variables during startup
 */

interface EnvConfig {
  // Database
  POSTGRES_URL?: string
  
  // Authentication
  NEXTAUTH_SECRET?: string
  NEXTAUTH_URL?: string
  
  // Redis (optional)
  UPSTASH_REDIS_REST_URL?: string
  UPSTASH_REDIS_REST_TOKEN?: string
  
  // AWS S3
  NEXT_AWS_S3_ACCESS_KEY_ID?: string
  NEXT_AWS_S3_SECRET_ACCESS_KEY?: string
  NEXT_AWS_S3_REGION?: string
  NEXT_AWS_S3_BUCKET_NAME?: string
  
  
  

}

const requiredEnvVars = [
  'POSTGRES_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const

const optionalEnvVars = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_AWS_S3_ACCESS_KEY_ID',
  'NEXT_AWS_S3_SECRET_ACCESS_KEY',
  'NEXT_AWS_S3_REGION',
  'NEXT_AWS_S3_BUCKET_NAME',
 
] as const

export function validateEnvironment(): {
  isValid: boolean
  missing: string[]
  warnings: string[]
  config: EnvConfig
} {
  const missing: string[] = []
  const warnings: string[] = []
  const config: EnvConfig = {}

  // Check required variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    if (!value) {
      missing.push(envVar)
    } else {
      config[envVar] = value
    }
  }

  // Check optional variables and warn if missing
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar]
    if (!value) {
      warnings.push(`Optional environment variable ${envVar} is not set`)
    } else {
      config[envVar] = value
    }
  }

  // Special checks
  if (!config.UPSTASH_REDIS_REST_URL || !config.UPSTASH_REDIS_REST_TOKEN) {
    warnings.push('Redis credentials not configured - using fallback implementation')
  }

  if (!config.NEXT_AWS_S3_ACCESS_KEY_ID || !config.NEXT_AWS_S3_SECRET_ACCESS_KEY) {
    warnings.push('AWS credentials not configured - file uploads may not work')
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    config
  }
}

export function logEnvironmentStatus() {
  const { isValid, missing, warnings, config } = validateEnvironment()

  console.log('🔧 Environment Configuration Status:')
  
  if (isValid) {
    console.log('✅ All required environment variables are set')
  } else {
    console.error('❌ Missing required environment variables:', missing)
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:')
    warnings.forEach(warning => console.warn(`   ${warning}`))
  }

  // Log available services
  console.log('📋 Available Services:')
  console.log(`   Database: ${config.POSTGRES_URL ? '✅' : '❌'}`)
  console.log(`   Redis: ${config.UPSTASH_REDIS_REST_URL ? '✅' : '❌ (fallback enabled)'}`)
  console.log(`   AWS S3: ${config.NEXT_AWS_S3_ACCESS_KEY_ID ? '✅' : '❌'}`)

  return { isValid, missing, warnings, config }
}

// Auto-validate on import in development
if (process.env.NODE_ENV === 'development') {
  logEnvironmentStatus()
} 