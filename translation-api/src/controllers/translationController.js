import Message from "../models/messageModel.js";
import publish from "../services/publish.js";

export const showMessage = async (req, res, next) => {
  /*
  #swagger.tags = ["Messages"]
  #swagger.responses[200]
  */

  try {
    const message = await Message.findOne(req.params);

    res.hateoas_item(message);
  } catch (err) {
    next(err);
  }
};

export const showAllMessages = async (req, res, next) => {
  /*
  #swagger.tags = ["Messages"]
  #swagger.responses[200]
  */

  try {
    const messages = await Message.find();

    //res.hateoas_collection(messages);
    res.json(
      messages.map((message) => ({
        id: message._id,
        text: message.text,
        text_translated: message.text_translated,
        status: message.status,
        links: [
          {
            rel: "self",
            href: `${process.env.SERVER}${req.baseUrl}/${message._id}`,
            method: "GET",
          },
          {
            rel: "update",
            href: `${process.env.SERVER}${req.baseUrl}/${message._id}`,
            method: "PATCH",
          },
        ],
      }))
    );
  } catch (err) {
    next(err);
  }
};

export const createMessage = async (req, res, next) => {
  /*
  #swagger.tags = ["Messages"]
  #swagger.requestBody = {
    required: true,
    schema: { $ref: "#/components/schemas/Message" }
  }
  #swagger.responses[201]
  */

  try {
    const message = await new Message({
      text: req.body.text,
    }).save();
    await publish({
      id: message._id,
      text: message.text,
      callback: {
        href: `${process.env.SERVER}${req.baseUrl}/${message._id}`,
        method: "PATCH",
      },
    });
    res.created();
  } catch (err) {
    next(err);
  }
};

export const updateMessage = async (req, res, next) => {
  /*
  #swagger.tags = ["Messages"]
  #swagger.requestBody = {
    required: true,
    schema: { $ref: "#/components/schemas/Message" }
  }
  #swagger.responses[204]
  */

  try {
    await Message.updateOne(req.params, {
      status: req.body.status,
      text_translated: req.body.text_translated,
    });
    res.no_content();
  } catch (err) {
    next(err);
  }
};
