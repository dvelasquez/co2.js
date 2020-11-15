import fs from "fs";
import path from "path";
import CO2 from "./co2";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pagexray from "pagexray";

describe("co2", function() {
  let har: any;
  let co2: any;
  const TGWF_GREY_VALUE = 2.0484539712;
  const TGWF_GREEN_VALUE = 0.54704300112;
  const TGWF_MIXED_VALUE = 1.6706517455999996;

  const MILLION = 1000000;
  const MILLION_GREY = 2.9064;
  const MILLION_GREEN = 2.318;

  beforeEach(function() {
    co2 = new CO2();
    har = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, "../data/fixtures/tgwf.har"),
        "utf8"
      )
    );
  });

  describe("perByte", function() {
    it("returns a CO2 number for data transfer using 'grey' power", function() {
      expect(co2.perByte(MILLION)).toBe(MILLION_GREY);
    });

    it("returns a lower CO2 number for data transfer from domains using entirely 'green' power", function() {
      expect(co2.perByte(MILLION, false)).toBe(MILLION_GREY);
      expect(co2.perByte(MILLION, true)).toBe(MILLION_GREEN);
    });
  });

  describe("perPage", function() {
    it("returns CO2 for total transfer for page", function() {
      const pages = pagexray.convert(har);
      const pageXrayRun = pages[0];

      expect(co2.perPage(pageXrayRun)).toBe(TGWF_GREY_VALUE);
    });
    it("returns lower CO2 for page served from green site", function() {
      const pages = pagexray.convert(har);
      const pageXrayRun = pages[0];
      const green = [
        "www.thegreenwebfoundation.org",
        "fonts.googleapis.com",
        "ajax.googleapis.com",
        "assets.digitalclimatestrike.net",
        "cdnjs.cloudflare.com",
        "graphite.thegreenwebfoundation.org",
        "analytics.thegreenwebfoundation.org",
        "fonts.gstatic.com",
        "api.thegreenwebfoundation.org"
      ];
      expect(co2.perPage(pageXrayRun, green)).toBeLessThan(TGWF_GREY_VALUE);
    });
    it("returns a lower CO2 number where *some* domains use green power", function() {
      const pages = pagexray.convert(har);
      const pageXrayRun = pages[0];
      // green can be true, or a array containing entries
      const green = [
        "www.thegreenwebfoundation.org",
        "fonts.googleapis.com",
        "ajax.googleapis.com",
        "assets.digitalclimatestrike.net",
        "cdnjs.cloudflare.com",
        "graphite.thegreenwebfoundation.org",
        "analytics.thegreenwebfoundation.org",
        "fonts.gstatic.com",
        "api.thegreenwebfoundation.org"
      ];
      expect(co2.perPage(pageXrayRun, green)).toBe(TGWF_MIXED_VALUE);
    });
  });
  describe("perDomain", function() {
    it("shows object listing Co2 for each domain", function() {
      const pages = pagexray.convert(har);
      const pageXrayRun = pages[0];
      const res = co2.perDomain(pageXrayRun);

      const domains = [
        "thegreenwebfoundation.org",
        "www.thegreenwebfoundation.org",
        "maxcdn.bootstrapcdn.com",
        "fonts.googleapis.com",
        "ajax.googleapis.com",
        "assets.digitalclimatestrike.net",
        "cdnjs.cloudflare.com",
        "graphite.thegreenwebfoundation.org",
        "analytics.thegreenwebfoundation.org",
        "fonts.gstatic.com",
        "api.thegreenwebfoundation.org"
      ];

      for (const obj of res) {
        expect(domains.indexOf(obj.domain)).toBeGreaterThan(-1);
        expect(typeof obj.co2).toBe("number");
      }
    });
    it("shows lower Co2 for green domains", function() {
      const pages = pagexray.convert(har);
      const pageXrayRun = pages[0];

      const greenDomains = [
        "www.thegreenwebfoundation.org",
        "fonts.googleapis.com",
        "ajax.googleapis.com",
        "assets.digitalclimatestrike.net",
        "cdnjs.cloudflare.com",
        "graphite.thegreenwebfoundation.org",
        "analytics.thegreenwebfoundation.org",
        "fonts.gstatic.com",
        "api.thegreenwebfoundation.org"
      ];
      const res = co2.perDomain(pageXrayRun);
      const resWithGreen = co2.perDomain(pageXrayRun, greenDomains);

      for (const obj of res) {
        expect(typeof obj.co2).toBe("number");
      }
      for (const obj of greenDomains) {
        let index = 0;
        expect(resWithGreen[index].co2).toBeLessThan(res[index].co2);
        index++;
      }
    });
  });
  // describe('perContentType', function () {
  //   test.skip('shows a breakdown of emissions by content type');
  // });
  // describe('dirtiestResources', function () {
  //   it.skip('shows the top 10 resources by CO2 emissions');
  // });
});
