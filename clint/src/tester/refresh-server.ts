import express from 'express';
import { HTMLTester } from './html-tester';
import cors from 'cors';
import { A11yTester } from './a11y-tester';
import { LinkTester } from './links-tester';
import * as fs from 'fs';

export class RefreshServer {
  private app: any;
  constructor() {
    this.app = express();

    this.app.use(cors());

    this.app.listen(3030, () => {
      console.log('Server running on port 3030');
    });

    this.app.use(express.static('public'));
  }

  public listenForA11yChanges() {
    this.app.get('/a11y-retest', cors(), (req, res, next) => {
      console.log('a11y-retest', req.query);
      const session = JSON.parse(fs.readFileSync('./data/session.json', 'utf8'));
      const a11yTester = new A11yTester();
      a11yTester
        .test(null, req.query.url, true, 'html-snippet', true, false, session.level ? session.level : 'WCAG2AAA')
        .then((result) => {
          res.json(result.filename);
        });
    });
  }

  public listenForHtmlChanges() {
    this.app.get('/html-retest', cors(), (req, res, next) => {
      console.log('html-retest', req.query);
      const htmlTester = new HTMLTester();
      htmlTester.test(null, req.query.url, true, 'html-snippet', true).then((result) => {
        res.json(result.filename);
      });
    });
  }

  public listenForLinksChanges() {
    this.app.get('/links-retest', cors(), (req, res, next) => {
      console.log('links-retest', req.query);
      const linksTester = new LinkTester();
      linksTester.test(null, req.query.url, true, 'html-snippet', true).then((result) => {
        res.json(result.filename);
      });
    });
  }
}
