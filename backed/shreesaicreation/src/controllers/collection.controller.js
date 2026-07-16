import { handleApiRequest } from '../utilities/apiResponse.js';
import CollectionService from '../services/CollectionService.js';

class CollectionController {
  create(req, res) {
    return handleApiRequest(req, res, async () => {
      const collection = await CollectionService.create(req.body);
      return [{ collection }, 'Collection created', 201];
    });
  }

  listAdmin(req, res) {
    return handleApiRequest(req, res, async () => {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 50);
      const isActive =
        req.query.isActive === undefined
          ? undefined
          : req.query.isActive === 'true';
      return CollectionService.listAdmin({
        page,
        limit,
        isActive,
        search: req.query.search,
      });
    });
  }

  listPublic(req, res) {
    return handleApiRequest(req, res, async () => CollectionService.listPublic());
  }

  getBySlug(req, res) {
    return handleApiRequest(req, res, async () =>
      CollectionService.getBySlugPublic(req.params.slug)
    );
  }

  getById(req, res) {
    return handleApiRequest(req, res, async () =>
      CollectionService.getById(req.params.id)
    );
  }

  update(req, res) {
    return handleApiRequest(req, res, async () =>
      CollectionService.update(req.params.id, req.body)
    );
  }

  remove(req, res) {
    return handleApiRequest(req, res, async () =>
      CollectionService.remove(req.params.id)
    );
  }
}

export default new CollectionController();
