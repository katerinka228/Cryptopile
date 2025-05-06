import { Spin, Table, Typography } from "antd";
import { useState } from "react";
import type { TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { LoadingOutlined } from "@ant-design/icons";
import type { CryptoDataType } from "./types.ts";
import { fetchData, transformData } from "./functions.ts";
import { Select, Button } from "antd";
import styles from "./Table.module.css";
import SparklineChart from "./SparklineChart.tsx";

const columns: TableColumnsType<CryptoDataType> = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    width: 60,
    align: 'center',
  },
  {
    title: "Logo",
    dataIndex: "logo",
    key: "logo",
    width: 80,
    render: (logo: string) => (
        <img src={logo} alt="Logo" style={{ width: "24px" }} />
    ),
    align: 'center',
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: 100,
    ellipsis: true,
  },
  {
    title: "Symbol",
    dataIndex: "symbol",
    key: "symbol",
    width: 100,
    align: 'center',
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    width: 120,
    align: 'right',
    className: styles.priceCell,
  },
  {
    title: "24h Change",
    dataIndex: "priceChange",
    key: "priceChange",
    width: 120,
    align: 'right',
    render: (change: string, record: CryptoDataType) => (
        <span className={record.priceChangeColor === '#52c41a' ? styles.positiveChange : styles.negativeChange}>
        {change}
      </span>
    ),
  },
  {
    title: "Market Cap",
    dataIndex: "marketCap",
    key: "marketCap",
    width: 150,
    align: 'right',
    className: styles.priceCell,
  },
  {
    title: "24h Volume",
    dataIndex: "volume",
    key: "volume",
    width: 150,
    align: 'right',
    className: styles.priceCell,
  },
  {
    title: "7d Chart",
    dataIndex: "sparkline",
    key: "sparkline",
    width: 200,
    render: (sparkline: number[], record: CryptoDataType) => (
        <div className={styles.chartContainer}>
          <SparklineChart
              data={sparkline}
              color={record.priceChangeColor}
              width={180}
              height={60}
          />
        </div>
    ),
  },
];

export default function CurrencyTable() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("market_cap_desc");

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["currencies", page, sort],
    queryFn: () => fetchData(page, sort),
  });

  if (isError) {
    return <div>Error: {error.toString()}</div>;
  }

  return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Typography.Title level={1} className={styles.title}>CRYPTOPILE</Typography.Title>
          <div className={styles.sort}>
            <Select
                defaultValue={sort}
                className={styles.sortSelect}
                onChange={(value) => setSort(value)}
                options={[
                  { value: "market_cap_asc", label: "Market Cap (Low to High)" },
                  { value: "market_cap_desc", label: "Market Cap (High to Low)" },
                  { value: "volume_asc", label: "Volume (Low to High)" },
                  { value: "volume_desc", label: "Volume (High to Low)" },
                  { value: "price_asc", label: "Price (Low to High)" },
                  { value: "price_desc", label: "Price (High to Low)" },
                ]}
            />
          </div>
        </div>

        {isLoading ? (
            <Spin
                className={styles.loading}
                indicator={<LoadingOutlined style={{ fontSize: 56 }} spin />}
            />
        ) : (
            <Table
                className={styles.table}
                columns={columns}
                dataSource={transformData(data, sort)}
                pagination={{
                  current: page,
                  pageSize: 10,
                  showSizeChanger: false,
                  hideOnSinglePage: true,
                }}
                size="small"
                tableLayout="fixed"
            />
        )}

        <div className={styles.pagination}>
          <Button
              className={styles.paginationButton}
              size="large"
              onClick={() => page > 1 && setPage(page - 1)}
          >
            ←
          </Button>
          <Typography.Text className={styles.paginationText}>
            {page}
          </Typography.Text>
          <Button
              className={styles.paginationButton}
              size="large"
              onClick={() => setPage(page + 1)}
          >
            →
          </Button>
        </div>
      </div>
  );
}