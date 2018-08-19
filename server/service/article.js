import mongoose from 'mongoose'
const Article = mongoose.model('Article')

export async function fetchList(page = 1, size = 20) {
  const data = await Article
    .find({}, { __v: 0, password: 0, content:0 })
    .skip((page - 1) * size)
    .limit(Number(size))
    .sort({ '_id': -1 })
    .populate({ path: 'type', select: 'name' })
    .populate({ path: 'tags', select: 'name' })
    .populate({ path: 'author', select: 'username' })
    .exec()

  return data
}

export async function fetchDetail({_id, username, userid}) {
  const entity = await Article.findOne({ _id }, { __v: 0 }).lean().exec()

  // default value （要不要节省流量不传递呢？）
  entity.isLike = false

  // 如果 存在点赞人list 且 传了参数 再去编译，节省系统开支
  if ((entity.likeList.length > 0) && (username || userid)) {
    const isHas = entity.likeList.some(i => i.name === username || i.id === userid)
    if(isHas) {
      entity.isLike = true
    }
  }

  return entity
}

export async function create(model) {
  model = new Article(model)
  model = await model.save()

  return model
}

export async function update(model) {
  try {
    let entity = await Article.findOne({ _id: model._id }).exec()

    //TODO: no data

    delete model._id
    entity = Object.assign(entity, model)
    entity = await entity.save()

    return entity

  } catch (err) {
    console.error(err)
  }
}

export async function remove(_id) {
  await Article.remove({ _id })

  return true
}

export async function addLiker({_id, username, userid}) {
  let entity = await Article.findOne({ _id }, { __v: 0 }).exec()
  // 数据服务层不管业务逻辑，业务逻辑交给控制器层
  entity.likeList.push({username, userid})
  entity = await entity.save()

  return entity
}
