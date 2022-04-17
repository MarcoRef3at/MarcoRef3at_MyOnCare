const dataInit = async model => {
  await model
    .bulkCreate(require(`../../_data/_${model.name}`))
    .then(async () => {
      const count = await model.count();
      console.log(`${model.name} Created:`.bgYellow.black.bold, count);
    })
    .catch(e => {
      console.log(`Create ${model} Error:`, e);
    });
};
module.exports = dataInit;
