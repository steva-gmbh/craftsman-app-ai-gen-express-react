import React from 'react';
import {
  // Sidebar and navigation
  IconHome,
  IconUsers,
  IconBriefcase,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconBox,
  IconTool,
  IconUsersGroup,
  IconHammer,
  
  // User profile
  IconDoorExit,
  
  // AI Assistant
  IconCpu,
  IconSend,
  IconTrash,
  IconRobot,
  
  // Dialog
  IconX,
  
  // Dashboard
  IconCurrencyEuro,
  IconClock,
  
  // Tables and forms
  IconPlus,
  IconFilter,
  IconEdit,
  
  // Users and customers
  IconPhone,
  IconMail,
  IconMapPin,
  IconUser,
  
  // Settings
  IconBuilding,
  IconCreditCard,
  IconBell,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';

// Re-export all icons with a consistent interface
export {
  // Sidebar and navigation
  IconHome,
  IconUsers,
  IconBriefcase,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconBox,
  IconTool,
  IconUsersGroup,
  IconHammer,
  
  // User profile
  IconDoorExit,
  
  // AI Assistant
  IconCpu,
  IconSend,
  IconTrash,
  IconRobot,
  
  // Dialog
  IconX,
  
  // Dashboard
  IconCurrencyEuro,
  IconClock,
  
  // Tables and forms
  IconPlus,
  IconFilter,
  IconEdit,
  
  // Users and customers
  IconPhone,
  IconMail,
  IconMapPin,
  IconUser,
  
  // Settings
  IconBuilding,
  IconCreditCard,
  IconBell,
  IconSun,
  IconMoon,
};

// Icon component with default props
export const Icon = ({ 
  icon: IconComponent, 
  size = 24, 
  stroke = 1.5,
  className = '',
  ...props 
}: { 
  icon: typeof IconHome; 
  size?: number;
  stroke?: number;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <IconComponent 
      size={size} 
      stroke={stroke} 
      className={className}
      {...props}
    />
  );
}; 