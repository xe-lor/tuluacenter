import React from "react";
import styles from "./shared.module.css";

const Bar = ({ width = "100%", height = 12, style }) => (
    <div
        className={styles.skeleton}
        style={{ width, height, flexShrink: 0, ...style }}
    />
);

// Renders `count` placeholder cards. Pass the page's real card class so the
// skeleton gets exactly the same size, border, radius and shadow.
const CardSkeleton = ({ count = 8, cardClassName, cardStyle }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                aria-hidden="true"
                className={cardClassName}
                style={{ pointerEvents: "none", ...cardStyle }}
            >
                {/* banner */}
                <div style={{ height: "27%", flexShrink: 0 }}>
                    <div
                        className={styles.skeleton}
                        style={{ width: "100%", height: "100%", borderRadius: 0 }}
                    />
                </div>

                {/* content */}
                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        padding: "0 16px 14px",
                    }}
                >
                    {/* avatar overlapping the banner */}
                    <div
                        style={{
                            width: "50%",
                            aspectRatio: "1 / 1",
                            marginTop: "-32%",
                            padding: 3,
                            boxSizing: "border-box",
                            borderRadius: "50%",
                            background: "#fff",
                            flexShrink: 0,
                        }}
                    >
                        <div
                            className={styles.skeleton}
                            style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                        />
                    </div>

                    <Bar width="35%" height={10} />
                    <Bar width="70%" height={14} />

                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <Bar width="30%" height={10} />
                        <Bar width="35%" height={10} />
                    </div>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <Bar width="30%" height={10} />
                        <Bar width="25%" height={10} />
                    </div>

                    <Bar width="30%" height="auto" style={{ aspectRatio: "1 / 1", borderRadius: 10, marginTop: "auto" }} />
                </div>
            </div>
        ))}
    </>
);

export default CardSkeleton;