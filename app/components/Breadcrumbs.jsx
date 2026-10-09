import { useRouter } from "next/navigation";

// "Home › Game › Topic". Every crumb but the last is a link; the last is the current page.
export default function Breadcrumbs({ items }) {
  const router = useRouter();
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={item.href ?? item.label}>
              {current ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <a
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    router.push(item.href);
                  }}
                >
                  {index === 0 && <span aria-hidden="true">🏠 </span>}
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
