import { handleApiRequest } from '../utilities/apiResponse.js';
import CategoryService from '../services/CategoryService.js';

class CategoryController {
  create(req, res) {
    return handleApiRequest(req, res, async () => {
      const category = await CategoryService.create(req.body);
      return [{ category }, 'Category created', 201];
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
      return CategoryService.listAdmin({
        page,
        limit,
        isActive,
        search: req.query.search,
      });
    });
  }

  listPublic(req, res) {
    return handleApiRequest(req, res, async () => CategoryService.listPublic());
  }

  getBySlug(req, res) {
    return handleApiRequest(req, res, async () =>
      CategoryService.getBySlugPublic(req.params.slug)
    );
  }

  getById(req, res) {
    return handleApiRequest(req, res, async () =>
      CategoryService.getById(req.params.id)
    );
  }

  update(req, res) {
    return handleApiRequest(req, res, async () =>
      CategoryService.update(req.params.id, req.body)
    );
  }

  reorder(req, res) {
    return handleApiRequest(req, res, async () =>
      CategoryService.reorder(req.body.items)
    );
  }

  remove(req, res) {
    return handleApiRequest(req, res, async () =>
      CategoryService.remove(req.params.id)
    );
  }
}

export default new CategoryController();
