
import { useState } from "react";
import styles from "@/styles/UI/tabs.module.css";

export default function Tabs({ id = "tabs", tabs }) {
    console.log(tabs);

    const tabNames = Object.keys(tabs);
    const [activeTab, setActiveTab] = useState(tabNames[0]);
    console.log(tabs[activeTab]);

    return (
        <div className={styles.tabsContainer} id={id}>
            <div className={styles.tabHeader}>
                {tabNames.map((tab) => {
                    return (
                        <div
                            key={tab}
                            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </div>
                    )
                })}
            </div>

            <div className={styles.tabContent}>{tabs[activeTab]}</div>
        </div>
    );
}
