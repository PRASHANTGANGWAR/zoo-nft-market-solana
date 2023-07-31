import { InboxOutlined } from "@ant-design/icons";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Alert,
  Label,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  notification,
  Radio,
  Result,
  Row,
  Upload,
} from "antd";
import { useForm } from "antd/lib/form/Form";
import * as ipfsClient from "ipfs-http-client";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectionContext from "../contexts/collection-context";
import { NFT_SYMBOL, ZOO_NFT_MARKET_PROGRAM_ID } from "../data/Constants";
import ZooNftMarketIdl from "../idl/zoo_nft_market_solana.json";
import * as Market from "../util/Market";
import * as Mint from "../util/Mint";

// const ipfs = ipfsClient.create({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
// });

const Admin = () => {
  const { publicKey, connected } = useWallet();
  console.log(publicKey);
  return (
    <Row style={{ margin: 60 }}>
      <Col span={16} offset={4} style={{ marginTop: 10 }}>
        <Card title="Admin Wallet Details">
        <Form.Item label="Address">
                  <Radio.Group
                    style={{ width: "100%" }}
                  >
                    <Row gutter={12}>
                      <Col span={12}>
                        <Radio.Button
                          style={{ width: "100%" }}
                          value={publicKey}
                          disabled
                        >
                          5JuxCQCE1mcGhacVa4gpmtCrNzQje49YLZbgKsSrzjVL
                        </Radio.Button>
                      </Col>
                    </Row>
                  </Radio.Group>
                </Form.Item>
        </Card>
      </Col>
    </Row>
  );
};

export default Admin;
