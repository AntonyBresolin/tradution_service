import yup from "yup";

export default yup
  .object()
  .shape({
    text: yup
      .string()
      .min(2, "Too short (text)")
      .max(1000, "Too long (text)")
      .required("Required (text)"),
    status: yup
      .string()
      .default("queued")    
  });
