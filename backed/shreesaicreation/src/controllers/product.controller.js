import { handleApiRequest } from '../utilities/apiResponse.js';
import ProductService from '../services/ProductService.js';

class ProductController {
  create(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await ProductService.create(req.body);
      return [result, 'Product created', 201];
    });
  }

  listAdmin(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.listAdmin({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 24),
        status: req.query.status,
        search: req.query.search,
        categoryId: req.query.categoryId,
        sort: req.query.sort,
      })
    );
  }

  listPublic(req, res) {
    return handleApiRequest(req, res, async () => ProductService.listPublic(req.query));
  }

  search(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.searchPublic(req.query.q, req.query)
    );
  }

  filters(req, res) {
    return handleApiRequest(req, res, async () => {
      const filters = await ProductService.getFilters();
      return [{ filters }, 'OK'];
    });
  }

  getBySlug(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.getBySlugPublic(req.params.slug)
    );
  }

  getById(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.getById(req.params.id)
    );
  }

  update(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.update(req.params.id, req.body)
    );
  }

  updateStatus(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.updateStatus(req.params.id, req.body.status)
    );
  }

  remove(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.remove(req.params.id)
    );
  }

  addVariant(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await ProductService.addVariant(req.params.id, req.body);
      return [result, 'Variant added', 201];
    });
  }

  updateVariant(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.updateVariant(req.params.id, req.params.variantId, req.body)
    );
  }

  removeVariant(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.removeVariant(req.params.id, req.params.variantId)
    );
  }

  attachMedia(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductService.attachMedia(req.params.id, req.body)
    );
  }
}

export default new ProductController();
