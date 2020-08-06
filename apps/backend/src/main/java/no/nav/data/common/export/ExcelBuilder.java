package no.nav.data.common.export;

import lombok.SneakyThrows;
import org.docx4j.openpackaging.packages.SpreadsheetMLPackage;
import org.docx4j.openpackaging.parts.PartName;
import org.docx4j.openpackaging.parts.SpreadsheetML.WorksheetPart;
import org.xlsx4j.jaxb.Context;
import org.xlsx4j.sml.CTRst;
import org.xlsx4j.sml.CTXstringWhitespace;
import org.xlsx4j.sml.ObjectFactory;
import org.xlsx4j.sml.STCellType;

import java.io.ByteArrayOutputStream;

public class ExcelBuilder {

    private static final ObjectFactory fac = Context.getsmlObjectFactory();

    private final SpreadsheetMLPackage pack;
    private final WorksheetPart sheet;

    long rowN = 0;

    @SneakyThrows
    public ExcelBuilder(String sheetName) {
        pack = SpreadsheetMLPackage.createPackage();
        sheet = pack.createWorksheetPart(new PartName("/xl/worksheets/sheet1.xml"), sheetName, 1);
    }

    public ExcelRow addRow() {
        return new ExcelRow();
    }

    public class ExcelRow {

        org.xlsx4j.sml.Row row = fac.createRow();
        char col = 'A';

        public ExcelRow() {
            row.setR(++rowN);
            sheet.getJaxbElement().getSheetData().getRow().add(row);
        }

        public ExcelRow addCell(String content) {
            var cell = fac.createCell();

            CTXstringWhitespace t = fac.createCTXstringWhitespace();
            t.setValue(content);
            CTRst ctRst = fac.createCTRst();
            ctRst.setT(t);

            cell.setIs(ctRst);
            cell.setR("%s%s".formatted(col++, rowN));
            cell.setT(STCellType.INLINE_STR);
            row.getC().add(cell);
            return this;
        }

    }

    @SneakyThrows
    public byte[] build() {
        var outStream = new ByteArrayOutputStream();
        pack.save(outStream);
        return outStream.toByteArray();
    }
}