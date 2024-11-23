import Link from "next/link";

export default function Home() {
  return (
    <div>
      <span>Chat app</span>
      <Link href={'/chat'}>
      <span>Go to chat</span>
      </Link>
    </div>
  );
}
