import React, { useLayoutEffect, useRef, useState } from "react";
import styles from "./shared.module.css";

// Counts the columns of the table this component is rendered in
export const useColumnCount = () => {
    const ref = useRef(null);
    const [count, setCount] = useState(0);

    useLayoutEffect(() => {
        const table = ref.current?.closest("table");
        const cells = table?.querySelectorAll("thead tr:last-child > th") ?? [];
        const total = Array.from(cells).reduce(
            (sum, th) => sum + (th.colSpan || 1),
            0
        );
        setCount(total || 1);
    }, []);

    return [ref, count];
};

const TableSkeleton = ({ rows = 5, widths = [], rowClassName, cellPadding }) => {
    const [ref, count] = useColumnCount();

    if (count === 0) return <tr ref={ref} aria-hidden="true" />;

    return (
        <>
            {Array.from({ length: rows }).map((_, r) => (
                <tr key={r} aria-hidden="true" className={rowClassName}>
                    {Array.from({ length: count }).map((_, c) => (
                        <td
                            key={c}
                            style={
                                cellPadding !== undefined
                                    ? { padding: cellPadding }
                                    : undefined
                            }
                        >
                            <div
                                className={styles.skeleton}
                                style={{ width: widths[c] ?? "70%" }}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableSkeleton;