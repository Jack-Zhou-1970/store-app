import React, { useEffect, useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import api from "../api";

import { Button } from "antd";
import { Row, Col } from "antd";

import "regenerator-runtime/runtime";

//test data
import { paymentDetails } from "../public_data";

export default function CheckoutForm() {
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("");

  const [clientSecret, setClientSecret] = useState(null);
  const [customerId, setCustomerId] = useState("");

  const [billInfo, setBillInfo] = useState("");
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Step 1:get bill info and display to customer to confirm

    api.getBillInfo(paymentDetails).then((billInfo) => {
      //important save bill infomation for future use
      setBillInfo(billInfo);

      setAmount(billInfo.TotalPrice.totalPriceAfterTax / 100);
      setCurrency("CAD");

      // Step 2: Create PaymentIntent over Stripe API

      paymentDetails.orderNumber = billInfo.orderNumber;

      api
        .createPaymentIntent(paymentDetails)
        .then((data) => {
          setClientSecret(data.client_secret);
          setCustomerId(data.customer);
        })
        .catch((err) => {
          setError(err.message);
        });
    });
  }, []);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);

    // Step 3: Use clientSecret from PaymentIntent and the CardElement
    // to confirm payment with stripe.confirmCardPayment()
    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: ev.target.name.value,
        },
      },
    });

    var payment = new Object();

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);

      payment = {
        ...paymentDetails,
        paymentInstend: payload.paymentIntent.id,
        customerId: customerId,
        status: "fail",
      };
    } else {
      setError(null);
      setSucceeded(true);
      setProcessing(false);
      setMetadata(payload.paymentIntent);

      payment = {
        ...paymentDetails,
        paymentInstend: payload.paymentIntent.id,
        customerId: customerId,
        status: "success",
      };
    }

    //send status to server

    api.setPayment(payment).then((result) => {
      console.log("payment complete");
    });
  };

  const renderForm = () => {
    const options = {
      style: {
        base: {
          color: "#32325d",
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#fa755a",
          iconColor: "#fa755a",
        },
      },
    };

    return (
      <div>
        <div style={{ marginTop: "2%" }}>
          <div
            style={{
              border: "1px solid #bdb6b6",
              width: "40%",
              marginTop: "2%",
            }}
          >
            <CardNumberElement options={options} />
          </div>

          <div
            style={{
              border: "1px solid #bdb6b6",
              width: "40%",
              marginTop: "2%",
            }}
          >
            <CardExpiryElement options={options} />
          </div>

          <div
            style={{
              border: "1px solid #bdb6b6",
              width: "40%",
              marginTop: "2%",
            }}
          >
            <CardCvcElement options={options} />
          </div>
        </div>

        {error && <div>{error}</div>}

        <Button
          disabled={processing || !clientSecret || !stripe}
          onClick={handleSubmit}
        >
          {processing ? "Processing…" : "Pay"}
        </Button>
      </div>
    );
  };

  return <div>{renderForm()}</div>;
}
