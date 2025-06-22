const mapper = {
  toJSON: {
    transform: function (doc: any, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: function (doc: any, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
};

export default mapper;
