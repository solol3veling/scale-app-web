import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Globe,
  Chrome
} from "lucide-react"

export interface PlatformConfig {
  name: string
  icon: any
  color: string
  bgColor: string
  textColor: string
}

export const platformConfigs: Record<string, PlatformConfig> = {
  FACEBOOK: {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600"
  },
  TWITTER: {
    name: "Twitter",
    icon: Twitter,
    color: "bg-sky-500",
    bgColor: "bg-sky-50",
    textColor: "text-sky-500"
  },
  INSTAGRAM: {
    name: "Instagram", 
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600"
  },
  LINKEDIN: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700",
    bgColor: "bg-blue-50", 
    textColor: "text-blue-700"
  },
  GOOGLE: {
    name: "Google",
    icon: Chrome,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-500"
  }
}

export const getPlatformConfig = (platform: string): PlatformConfig => {
  return platformConfigs[platform.toUpperCase()] || {
    name: platform,
    icon: Globe,
    color: "bg-gray-500",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600"
  }
}