import dynamic from "next/dynamic";
const NetworkShell = dynamic(() => import("./NetworkShell").then((m) => m.NetworkShell), { loading: () => <div /> });
export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  return <NetworkShell>{children}</NetworkShell>;
}
