import Link from 'next/link';

export default function IndexPage() {
  return (
    <div>
      Supported App Features:
      <ul>
        <li>
          <Link href="/doc-slash-command">Doc Slash Command</Link>
        </li>
        <li>
          <Link href="/object-view">Custom Object</Link>
        </li>
      </ul>
    </div>
  );
}
