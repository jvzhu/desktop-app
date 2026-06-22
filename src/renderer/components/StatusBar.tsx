interface StatusBarProps {
  message: string;
}

export function StatusBar({ message }: StatusBarProps) {
  return <footer className="statusbar">{message}</footer>;
}
