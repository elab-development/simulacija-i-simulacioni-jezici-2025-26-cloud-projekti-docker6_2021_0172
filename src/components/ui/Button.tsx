interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  
  // Base styles: Osnovni izgled (zaobljeno, centriran tekst, tranzicija boje)
  const baseStyles = "w-full py-3 px-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2 active:scale-[0.98]";
  
  const variants = {
    // PRIMARY: Plava -> Na hover postaje malo svetlija plava (bez senke okolo)
    primary: "bg-blue-600 text-white hover:bg-blue-500 border border-transparent",
    
    // SECONDARY: Siva -> Na hover postaje malo svetlija siva
    secondary: "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white",
    
    // DANGER: Crvena -> Na hover postaje malo svetlija crvena
    danger: "bg-red-600 text-white hover:bg-red-500 border border-transparent",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
}