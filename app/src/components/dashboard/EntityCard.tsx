"use client";

import { NumberTicker } from "@/components/magicui/number-ticker";
import { cn } from "@/lib/utils";
import { EntityType } from "@/types";

interface EntityCardProps {
  title: string;
  count: number;
  entityType: EntityType;
  description?: string;
  color: "red" | "blue" | "green" | "yellow" | "purple" | "orange";
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const colorClasses = {
  red: "bg-red-600 hover:bg-red-700 text-white",
  blue: "bg-blue-600 hover:bg-blue-700 text-white",
  green: "bg-green-600 hover:bg-green-700 text-white",
  yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
  purple: "bg-purple-600 hover:bg-purple-700 text-white",
  orange: "bg-orange-600 hover:bg-orange-700 text-white",
};

export function EntityCard({
  title,
  count,
  entityType,
  description,
  color,
  icon,
  isActive = false,
  onClick,
}: EntityCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg p-6 shadow-md transition-transform duration-200 cursor-pointer transform hover:scale-105",
        colorClasses[color],
        isActive && "border-b-4 border-white shadow-lg"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          {description && (
            <p className="text-sm opacity-80 mb-3">{description}</p>
          )}
          <div className="flex items-end space-x-1">
            <span className="text-3xl font-bold">
              <NumberTicker
                value={count}
                startValue={0}
                direction="up"
                delay={0.2}
              />
            </span>
            <span className="text-sm opacity-80 mb-1">total</span>
          </div>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
} 