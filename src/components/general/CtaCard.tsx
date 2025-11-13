import React, { ComponentType } from "react";
import { Card } from "../ui/card";
import { Ban, CreditCard, LucideProps, SendHorizonal } from "lucide-react";

interface CardProps {
  name: string;
  icon: ComponentType<LucideProps>;
  color: string;
}

const ctaActions: CardProps[] = [
  { name: "Fund Card", icon: CreditCard, color: "#453203" },
  { name: "Send Money", icon: SendHorizonal, color: "#8E4B9F" },
  { name: "Freeze Card", icon: Ban, color: "#C56249" },
];

const CtaCard = ({ name, icon: Icon, color }: CardProps) => {
  return (
    <>
      <Card
        className="p-2 md:p-4 flex flex-col items-start justify-end rounded-xl text-white"
        style={{ backgroundColor: color, borderColor: color }}
      >
        <div className="rounded-full bg-white/20 p-2 mb-2">
          <Icon className="md:w-6 md:h-6 h-3 w-3" />
        </div>
        <div className="font-medium sm:text-base text-sm md:text-lg">
          {name}
        </div>
      </Card>
    </>
  );
};

const CtaLine = () => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mt-5 md:p-0">
        {ctaActions.map((action) => (
          <CtaCard
            key={action.name}
            icon={action.icon}
            name={action.name}
            color={action.color}
          />
        ))}
      </div>
    </div>
  );
};

export default CtaLine;
