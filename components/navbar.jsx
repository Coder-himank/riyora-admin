import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { Home, Package, ShoppingCart, FileText, CreditCard, Info, StarIcon } from 'lucide-react'; // icons
import { FaBars } from 'react-icons/fa';
import { TbReportMedical } from 'react-icons/tb';
import { MdReport } from 'react-icons/md';
import { useRouter } from 'next/router';
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
            // { href: 'https://app.shiprocket.in/seller/orders/new', label: 'Orders', icon: <ShoppingCart /> },
            { href: '/orders', label: 'Orders', icon: <ShoppingCart /> },
            { href: '/products', label: 'Products', icon: <Package /> },
            { href: '/complaint', label: 'Comaplaints', icon: <MdReport /> },
            { href: '/reviews', label: 'Reviews', icon: <StarIcon /> },
        ],
    },
    {
        title: 'Content',
        links: [
            { href: '/predefined', label: 'Predefined Values', icon: <FileText /> },
            { href: '/blogs', label: 'Blogs', icon: <FileText /> },
            { href: 'https://dashboard.razorpay.com/app/payments', label: 'Transactions', icon: <CreditCard /> },
        ],
    },
    {
        title: 'Offers',
        links: [
            { href: '/promocode', label: 'Promocode', icon: <FileText /> },
        ],
    }
];

export default function Navbar() {
    const pathname = usePathname();
    const [collapse, setCollapse] = useState(true);
    const { data: session } = useSession();


    useEffect(() => {
        setCollapse(true)
    }, [pathname])



    return (
        <>
            <div className="mobile_header">
                <span className='bars' onClick={() => setCollapse(false)}>

                    <FaBars />
                </span>
            </div>
            <aside className={`${collapse ? "sidebar-collapsed" : ""}   sidebar`}
                onMouseOver={() => setCollapse(false)}
                onMouseLeave={() => setCollapse(true)}
            >
                {/* Logo */}
                <div className="sidebar-logo">
                    <span className='bars' >

                        <FaBars />
                    </span>
                    {!collapse &&
                        <>
                            <Image src="/images/logo.png" width={40} height={40} alt="logo" />
                            <h2 className="logo-text">Riyora</h2>
                        </>
                    }
                </div>

                {/* Profile */}
                <Link href={session?.user ? `/${session?.user?.id}` : "/authenticate"} className="sidebar-profile-link">
                    <div className="sidebar-profile">
                        <Image src="/images/user.png" width={40} height={40} alt="User Profile" />

                        {!collapse &&
                            <span className="username">{session?.user?.name || "Login"}</span>
                        }
                    </div>
                </Link>

                {/* Navigation Sections */}
                <nav>
                    {navSections.map((section) => (
                        <div key={section.title} className="nav-section">
                            {/* {!collapse &&  */}
                            <h4 className="section-title" style={{ visibility: collapse ? "hidden" : "visible" }}>{section.title}</h4>
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
        </>
    );
}
