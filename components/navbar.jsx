import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { Home, Package, ShoppingCart, FileText, CreditCard } from 'lucide-react'; // icons
import { FaBars } from 'react-icons/fa';
const navSections = [
    {
        title: 'Main',
        links: [
            { href: '/', label: 'Home', icon: <Home /> },
        ],
    },
    {
        title: 'Management',
        links: [
            { href: '/orders', label: 'Orders', icon: <ShoppingCart /> },
            { href: '/products', label: 'Products', icon: <Package /> },
        ],
    },
    {
        title: 'Content',
        links: [
            { href: '/blogs', label: 'Blogs', icon: <FileText /> },
            { href: '/transactions', label: 'Transactions', icon: <CreditCard /> },
        ],
    }
];

export default function Navbar() {
    const pathname = usePathname();
    const [collapse, setCollapse] = useState(false);

    return (
        <aside className={`${collapse ? "sidebar-collapsed" : ""} sidebar`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <span className='bars'  onClick={()=> setCollapse(prev => !prev)} >

                <FaBars/>
                </span>
                {!collapse &&
                <>
                <Image src="/images/logo.png" width={40} height={40} alt="logo" />
                <h2 className="logo-text">Riyora</h2>
                </>
                }
            </div>

            {/* Profile */}
            <div className="sidebar-profile">
                <Image src="/images/user.png" width={40} height={40} alt="User Profile" />
                
                    {!collapse &&
                        <span className="username">Username</span>
                    }
            </div>

            {/* Navigation Sections */}
            <nav>
                {navSections.map((section) => (
                    <div key={section.title} className="nav-section">
                        {/* {!collapse &&  */}
                        <h4 className="section-title" style={{visibility : collapse ? "hidden" : "visible"}}>{section.title}</h4>
                        {/* } */}
                        {section.links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                            >
                                <span className="link-label">{link.icon}</span>
                                {!collapse && 
                                <span className="link-label">{link.label}</span>
                                }
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
