import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/orders', label: 'Orders' },
    { href: '/products', label: 'Products' },
    { href: '/blogs', label: 'Blogs' },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <div className='navbar'>
            <div className="nav-left">
                <Image src={"/images/logo.png"} width={100} height={100} alt={"logo"} />
            </div>
            <div className="nav-mid">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={pathname === link.href ? 'active' : ''}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
            <div className="nav-right">
                <button className="profile-btn">
                    <Image src="/images/user.png" width={40} height={40} alt="User Profile" />
                </button>
            </div>
        </div>
    );
}