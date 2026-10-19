import type { Recipe } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RecipeCover({
  recipe,
  className,
  emojiClassName,
}: {
  recipe: Pick<Recipe, "emoji" | "hue">;
  className?: string;
  emojiClassName?: string;
}) {
  const h = recipe.hue;
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, hsl(${h} 70% 92%) 0%, hsl(${h} 60% 80%) 55%, hsl(${(h + 25) % 360} 55% 70%) 100%)`,
      }}
    >
      <span
        aria-hidden
        className="absolute -right-4 -top-4 h-24 w-24 rounded-full"
        style={{ background: `hsl(${h} 70% 88% / 0.7)` }}
      />
      <span className={cn("relative drop-shadow-sm", emojiClassName ?? "text-[44px]")}>{recipe.emoji}</span>
    </div>
  );
}
