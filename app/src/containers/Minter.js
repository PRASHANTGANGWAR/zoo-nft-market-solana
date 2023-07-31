import { InboxOutlined } from "@ant-design/icons";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Alert,
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

const Minter = () => {
  let navigate = useNavigate();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [program, setProgram] = useState(null);
  const collectionCtx = useContext(CollectionContext);

  const [form] = useForm();
  const [imageFileBuffer, setImageFileBuffer] = useState(null);
  const [saleType, setSaleType] = useState("no_sale");

  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

  useEffect(() => {
    const provider = new anchor.AnchorProvider(connection, wallet);
    anchor.setProvider(provider);

    const program = new Program(
      ZooNftMarketIdl,
      ZOO_NFT_MARKET_PROGRAM_ID,
      provider
    );

    setProgram(program);
  }, [connection, wallet]);

  const onFileSelected = (file) => {
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setImageFileBuffer(Buffer(reader.result));
    };
    return false;
  };

  const onCreate = async (values) => {
    let {
      name,
      description,
      trait_size,
      trait_live_in,
      trait_food,
      sale_type,
      price,
      min_bid_price,
      auction_period,
    } = values;

    setUploading(true);
    let uploadedImageUrl = await Mint.uploadImageToIpfs(imageFileBuffer);
    setUploading(false);
    if (uploadedImageUrl == null) return;
    console.log("Uploaded image url: ", uploadedImageUrl);

    setUploading(true);
    let uploadedMetatdataUrl = await Mint.uploadMetadataToIpfs(
      name,
      NFT_SYMBOL,
      description,
      uploadedImageUrl,
      trait_size,
      trait_live_in,
      trait_food
    );
    setUploading(false);
    if (uploadedMetatdataUrl == null) return;
    console.log("Uploaded meta data url: ", uploadedMetatdataUrl);

    setMinting(true);
    const result = await Mint.mint(
      program,
      name,
      NFT_SYMBOL,
      uploadedMetatdataUrl
    );
    setMinting(false);

    if (result != null) {
      collectionCtx.loadItemMetadata(connection, result.metadataAddress, true);

      if (sale_type == "fixed_price_sale") {
        await createSale(
          program,
          result.mintKey,
          wallet,
          result.associatedTokenAddress,
          price
        );
      }
      setMintSuccess(true);
    } else {
      setMintSuccess(false);
    }
  };

  const createSale = async (
    program,
    mintKey,
    wallet,
    associatedTokenAddress,
    price
  ) => {
    const order = await Market.createOrder(
      program,
      mintKey,
      wallet.publicKey,
      associatedTokenAddress,
      "An order",
      price
    );

    if (order != null) {
      notification["success"]({
        message: "Success",
        description: "Created a sale of this item!",
      });
    }
  };

  const onMintAgain = () => {
    setMintSuccess(false);
    form.resetFields();
  };

  if (mintSuccess) {
    return (
      <Result
        style={{ marginTop: 60 }}
        status="success"
        title="Successfully minted new NFT!"
        subTitle="You can check this new NFT in your wallet."
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => navigate("/gallery")}
          >
            Go to Gallery
          </Button>,
          <Button key="buy" onClick={onMintAgain}>
            Mint Again
          </Button>,
        ]}
      />
    );
  }

  return (
    <Row style={{ margin: 60 }}>
      {minting && (
        <Col span={16} offset={4}>
          <Alert message="Minting..." type="info" showIcon />
        </Col>
      )}
      {uploading && (
        <Col span={16} offset={4}>
          <Alert message="Uploading image..." type="info" showIcon />
        </Col>
      )}
      <Col span={16} offset={4} style={{ marginTop: 10 }}>
        <Card title="Create New NFT">
          <Form
            form={form}
            layout="vertical"
            labelCol={8}
            wrapperCol={16}
            onFinish={onCreate}
          >
            <Row gutter={24}>
              <Col xl={12} span={24}>
                <Form.Item
                  label="Image"
                  name="image"
                  rules={[{ required: true, message: "Please select image!" }]}
                >
                  <Upload.Dragger
                    name="image"
                    beforeUpload={onFileSelected}
                    maxCount={1}
                    height={400}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for a singe image.
                    </p>
                  </Upload.Dragger>
                </Form.Item>
              </Col>
              <Col xl={12} span={24}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: "Please input name!" }]}
                >
                  <Input placeholder="Input nft name here." />
                </Form.Item>

                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { required: true, message: "Please input description!" },
                  ]}
                >
                  <Input.TextArea placeholder="Input nft description here." />
                </Form.Item>

                <Form.Item label="Traits">
                  <Input.Group size="large">
                    <Row gutter={12}>
                      <Col span={8}>
                        <Form.Item
                          name="trait_size"
                          rules={[
                            {
                              required: true,
                              message: "Please input size!",
                            },
                          ]}
                        >
                          <Input addonBefore="Size" placeholder="size" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="trait_live_in"
                          rules={[
                            {
                              required: true,
                              message: "Please input live in!",
                            },
                          ]}
                        >
                          <Input addonBefore="Live in" placeholder="live in" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="trait_food"
                          rules={[
                            {
                              required: true,
                              message: "Please input food!",
                            },
                          ]}
                        >
                          <Input addonBefore="Food" placeholder="food" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Input.Group>
                </Form.Item>

                <Form.Item label="Place On Marketplace" name="sale_type">
                  <Radio.Group
                    style={{ width: "100%" }}
                    onChange={(e) => setSaleType(e.target.value)}
                  >
                    <Row gutter={12}>
                      <Col span={8}>
                        <Radio.Button style={{ width: "100%" }} value="no_sale">
                          No Sale
                        </Radio.Button>
                      </Col>
                      <Col span={8}>
                        <Radio.Button
                          style={{ width: "100%" }}
                          value="fixed_price_sale"
                        >
                          Fixed Price Sale
                        </Radio.Button>
                      </Col>
                      <Col span={8}>
                        <Radio.Button
                          style={{ width: "100%" }}
                          value="auction"
                          disabled
                        >
                          Auction
                        </Radio.Button>
                      </Col>
                    </Row>
                  </Radio.Group>
                </Form.Item>

                {saleType == "fixed_price_sale" && (
                  <Form.Item
                    name="price"
                    label="Price"
                    rules={[{ required: true, message: "Please input price!" }]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Input your price"
                      addonAfter="SOL"
                    />
                  </Form.Item>
                )}

                {saleType == "auction" && (
                  <>
                    <Form.Item
                      name="min_bid_price"
                      label="Minimum Bid Price"
                      rules={[
                        {
                          required: true,
                          message: "Please input minimum bid price!",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Input your minimum bid price"
                        addonAfter="SOL"
                      />
                    </Form.Item>
                    <Form.Item
                      label="Auction Period"
                      name="auction_period"
                      rules={[
                        {
                          type: "array",
                          required: true,
                          message: "Please select time!",
                        },
                      ]}
                    >
                      <DatePicker.RangePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </>
                )}
              </Col>
            </Row>

            <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
              <Button type="primary" htmlType="submit" style={{ width: 200 }}>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default Minter;
