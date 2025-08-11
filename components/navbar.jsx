import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Package, ShoppingCart, FileText, CreditCard } from 'lucide-react'; // icons

const navSections = [
    {
        title: 'Main',
        links: [
            { href: '/', label: 'Home', icon: <Home size={20} /> },
        ],
    },
    {
        title: 'Management',
        links: [
            { href: '/orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
            { href: '/products', label: 'Products', icon: <Package size={20} /> },
        ],
    },
    {
        title: 'Content',
        links: [
            { href: '/blogs', label: 'Blogs', icon: <FileText size={20} /> },
            { href: '/transactions', label: 'Transactions', icon: <CreditCard size={20} /> },
        ],
    }
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <Image src="/images/logo.png" width={40} height={40} alt="logo" />
                <h2 className="logo-text">Riyora</h2>
            </div>

            {/* Profile */}
            <div className="sidebar-profile">
                <Image src="/images/user.png" width={40} height={40} alt="User Profile" />
                <span className="username">Username</span>
            </div>

            {/* Navigation Sections */}
            <nav>
                {navSections.map((section) => (
                    <div key={section.title} className="nav-section">
                        <h4 className="section-title">{section.title}</h4>
                        {section.links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                            >
                                {link.icon}
                                <span className="link-label">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
