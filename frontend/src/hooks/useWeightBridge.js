import { useState, useEffect } from 'react';
import { useFeachSingle, useFeachData } from './useApiHook';

export const useWeightBridge = (id, purchaseOrder, deliveryNote, info) => {
  // State for weight bridge functionality
  const [isGrossDisabled, setIsGrossDisabled] = useState(false);
  const [isTareDisabled, setIsTareDisabled] = useState(true);
  const [showInward, setShowInward] = useState(true);
  const [showOutward, setShowOutward] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const [wbslipTypeOptions, setWbslipTypeOptions] = useState([]);
  const [deductReasonOptions, setDeductReasonOptions] = useState([]);
  const [purchaseOrderOptions, setPurchaseOrderOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [transporterOptions, setTransporterOptions] = useState([]);
  const [deliveryNoteOptions, setDeliveryNoteOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [isNewRecord, setIsNewRecord] = useState(!id);
  const [displayData, setDisplayData] = useState("");
  const [isWeighScaleEnabled, setIsWeighScaleEnabled] = useState(false);
  const [serialPort, setSerialPort] = useState(null);
  const [purchaseOrderData, setPurchaseOrderData] = useState(null);
  const [deliveryNoteData, setDeliveryNoteData] = useState(null);

  // Get RMC Settings using hooks
  const { data: rmcSettings } = useFeachSingle({
    doctype: "RMC Settings",
    id: "enable_weigh_scale",
    fields: JSON.stringify(["enable_weigh_scale", "baud_rate", "split_character"])
  });


  // Extract select options from info API
  useEffect(() => {
    if (info?.fields) {
      // Extract WBSlip Type options
      const wbslipTypeField = info.fields.find(field => field.fieldname === 'wbslip_type');
      if (wbslipTypeField?.options) {
        const options = wbslipTypeField.options.split('\n').map(option => ({
          label: option,
          value: option
        }));
        setWbslipTypeOptions(options);
      }

      // Extract Deduct Reason options
      const deductReasonField = info.fields.find(field => field.fieldname === 'deduct_reason');
      if (deductReasonField?.options) {
        const options = deductReasonField.options.split('\n').map(option => ({
          label: option,
          value: option
        }));
        setDeductReasonOptions(options);
      }

    
      const itemField = info.fields.find(field => field.fieldname === 'item');
      if (itemField?.options_list) {       
        setItemOptions(itemField.options_list);
      }

      // Extract Purchase Order options
      const purchaseOrderField = info.fields.find(field => field.fieldname === 'purchase_order');
      if (purchaseOrderField?.options_list) {
        setPurchaseOrderOptions(purchaseOrderField.options_list);
      }

      // Extract Supplier options
      const supplierField = info.fields.find(field => field.fieldname === 'supplier_name');
      if (supplierField?.options_list) {
        const options = supplierField.options.split('\n').map(option => ({
          label: option,
          value: option
        }));
        setSupplierOptions(options);
      }

      // Extract Transporter options
      const transporterField = info.fields.find(field => field.fieldname === 'transporter');
      if (transporterField?.options) {
        const options = transporterField.options.split('\n').map(option => ({
          label: option,
          value: option
        }));
        setTransporterOptions(options);
      }

      // Extract Delivery Note options
      const deliveryNoteField = info.fields.find(field => field.fieldname === 'delivery_note');
      if (deliveryNoteField?.options) {
        const options = deliveryNoteField.options.split('\n').map(option => ({
          label: option,
          value: option
        }));
        setDeliveryNoteOptions(options);
      }

      // Extract Customer options
      const customerField = info.fields.find(field => field.fieldname === 'customer_name');
      if (customerField?.options) {
        const options = customerField.options.split('\n').map(option => ({
          label: option,
          value: option
        }));
        setCustomerOptions(options);
      }

      // Extract Vehicle options
      const vehicleField = info.fields.find(field => field.fieldname === 'vehicle');
      if (vehicleField?.options) {
        const options = vehicleField.options.split('\n').map(option => ({
          label: option,
          value: option
        }));
        setVehicleOptions(options);
      }
    }
  }, [info]);


  // Serial port listener function (matching doctype logic)
  const listenToPort = async (port, settings) => {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    let tempValue = 0;
    while (true) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }

        // Process the data (matching doctype logic)
        let newValue = String(value).includes(settings.split_character)
          ? String(value).replace(settings.split_character, "")
          : String(value);

        if (tempValue !== Number(newValue)) {
          tempValue = Number(newValue);
          setDisplayData(String(Number(newValue)));
        }
      } catch (error) {
        console.error("Error reading from serial port:", error);
        break;
      }
    }
  };

  // Initialize weigh scale connection
  useEffect(() => {
    let testInterval = null;

    const initializeWeighScale = async () => {

      setIsWeighScaleEnabled(true);

      // TEST START - random values every 5 seconds (matching doctype exactly)
      // testInterval = setInterval(() => {
      //   setDisplayData(Math.floor(Math.random() * (900 - 100 + 1)) + 100);
      // }, 5000);
      // TEST END

      // Check for serial port support
      if ("serial" in navigator && rmcSettings) {
        try {
          const ports = await navigator.serial.getPorts();
          if (ports.length === 0) {
            // Request permission to connect to weigh device
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: Number(rmcSettings.baud_rate) });
            setSerialPort(port);
            await listenToPort(port, rmcSettings);
          } else {
            await ports[0].open({ baudRate: Number(rmcSettings.message.baud_rate) });
            setSerialPort(ports[0]);
            await listenToPort(ports[0], rmcSettings);
          }
          if (testInterval) {
            clearInterval(testInterval);
          }
        } catch (error) {
          console.log("Serial port connection failed, using test mode:", error);
        }
      } else {
        console.log("Browser does not support serial device connection");
      }

    };

    initializeWeighScale();

    // Cleanup function to clear interval on unmount or dependency change
    return () => {
      if (testInterval) {
        clearInterval(testInterval);
      }
    };
  }, [id, rmcSettings]);

  // Cleanup serial port connection on unmount
  useEffect(() => {
    return () => {
      if (serialPort) {
        try {
          serialPort.close();
        } catch (error) {
          console.error("Error closing serial port:", error);
        }
      }
    };
  }, [serialPort]);

  // Handle WB slip type changes
  const handleWBSlipTypeChange = (wbslipType) => {
    if (wbslipType) {
      if (wbslipType === "Inward") {
        setShowInward(true);
        setShowOutward(false);
        setIsGrossDisabled(false);
        setIsTareDisabled(true);
      } else if (wbslipType === "Outward") {
        setShowInward(false);
        setShowOutward(true);
        setIsGrossDisabled(true);
        setIsTareDisabled(false);
      } else if (wbslipType === "Other") {
        setShowInward(true);
        setShowOutward(true);
        setIsGrossDisabled(false);
        setIsTareDisabled(false);
      }
    } else {
      // Default to Inward when no value is set
      setShowInward(true);
      setShowOutward(false);
      setIsGrossDisabled(false);
      setIsTareDisabled(true);
    }
  };

  // Handle gross weight button click (matching doctype logic)
  const handleGrossWeight = (setValue) => {
    if (displayData) {
      setValue('gross_weight', displayData);
      setValue('gross_weight_date_time', new Date().toISOString().slice(0, 19).replace('T', ' '));
      setIsGrossDisabled(true);
    }
  };

  // Handle tare weight button click (matching doctype logic)
  const handleTareWeight = (setValue) => {
    if (displayData) {
      setValue('tare_weight', displayData);
      setValue('tare_weight_date_time', new Date().toISOString().slice(0, 19).replace('T', ' '));
      setIsTareDisabled(true);
    }
  };

  // Weight calculation function (matching doctype logic)
  const calculateWeight = (grossWeight, tareWeight, deduct, setValue) => {
    if (grossWeight && tareWeight) {
      const netWeight = parseFloat(grossWeight) - parseFloat(tareWeight);
      setValue('net_weight', netWeight.toString());

      const grandNetDeduct = (parseFloat(deduct) || 0) / 100 * netWeight;
      setValue('grand_net_weight', (netWeight - grandNetDeduct).toString());
    }
  };

  return {
    // State
    isGrossDisabled,
    isTareDisabled,
    showInward,
    showOutward,
    itemOptions,
    wbslipTypeOptions,
    deductReasonOptions,
    purchaseOrderOptions,
    supplierOptions,
    transporterOptions,
    deliveryNoteOptions,
    customerOptions,
    vehicleOptions,
    isNewRecord,
    displayData,
    isWeighScaleEnabled,
    serialPort,

    // Data
    rmcSettings,
    purchaseOrderData,
    deliveryNoteData,

    // Actions
    handleWBSlipTypeChange,
    handleGrossWeight,
    handleTareWeight,
    calculateWeight,
    setItemOptions,
    setIsGrossDisabled,
    setIsTareDisabled,
    setShowInward,
    setShowOutward,
  };
};
