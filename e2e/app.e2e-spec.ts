import { KindergartenPage } from './app.po';

describe('kindergarten App', () => {
  let page: KindergartenPage;

  beforeEach(() => {
    page = new KindergartenPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
