import { ArrowUpRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type SplitButtonProps = {
  children: ReactNode;
  icon?: ElementType;
  dark?: boolean;
  className?: string;
  href?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "className"> &
  Pick<ComponentPropsWithoutRef<"a">, "target" | "rel">;

export function SplitButton({ children, icon: Icon = ArrowUpRight, dark = false, className, href, target, rel, onClick, type = "button", ...props }: SplitButtonProps) {
  const cls = `split-cta ${dark ? "split-cta-dark" : ""} ${className ?? ""}`;
  const content = <>
    <span className="split-cta-label">{children}</span>
    <span className="split-cta-icon"><Icon /></span>
  </>;

  if (href) {
    return <a href={href} target={target} rel={rel} className={cls} onClick={onClick as unknown as ComponentPropsWithoutRef<"a">["onClick"]}>{content}</a>;
  }
  return <button type={type} className={cls} onClick={onClick} {...props}>{content}</button>;
}
