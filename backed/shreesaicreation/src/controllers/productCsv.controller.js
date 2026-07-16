import { handleApiRequest } from '../utilities/apiResponse.js';
import ProductCsvService from '../services/ProductCsvService.js';

class ProductCsvController {
  async exportProducts(req, res) {
    try {
      const csv = await ProductCsvService.exportCsv({
        status: req.query.status,
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="products-export.csv"'
      );
      return res.status(200).send(csv);
    } catch (error) {
      const { handleError } = await import('../utilities/apiResponse.js');
      return handleError(res, error);
    }
  }

  importProducts(req, res) {
    return handleApiRequest(req, res, async () => {
      const text =
        req.file?.buffer?.toString('utf8') ||
        req.body?.csv ||
        (typeof req.body === 'string' ? req.body : null);
      if (!text) {
        const { ValidationError } = await import('../utilities/apiResponse.js');
        throw new ValidationError('Upload a CSV file (field: file) or body.csv');
      }
      const result = await ProductCsvService.importCsv(text);
      return [result, 'Import completed'];
    });
  }

  setRelated(req, res) {
    return handleApiRequest(req, res, async () =>
      ProductCsvService.setRelatedProducts(
        req.params.id,
        req.body.relatedProductIds
      )
    );
  }
}

export default new ProductCsvController();
