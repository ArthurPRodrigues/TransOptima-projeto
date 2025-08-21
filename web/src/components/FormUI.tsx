import type { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200">
      {children}
    </div>
  );
}

export function CardHeader({ title, icon }: { title: string; icon?: ReactNode }) {
  return (
    <div className="bg-teal-600 text-white rounded-t-2xl px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      {icon}
    </div>
  );
}

export function Grid2({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 ${props.className||''}`}
    />
  );
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg font-medium ${props.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'} ${props.className||''}`}
    />
  );
}
