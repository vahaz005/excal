import { Icon, Pencil } from 'lucide-react'
import { LucideProps } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

const IconButton = ({
  Icon,
  onClick,
  activated,
}: {
  Icon: React.ElementType;
  onClick: () => void;
  activated: boolean;
}) => {
  return (
    <Button
      onClick={onClick}
      className={`
        transition
        ${activated ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-800"}
      `}
    >
      <Icon />
    </Button>
  );
};

export default IconButton
