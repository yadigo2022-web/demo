import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import org.knowm.xchart.*;
import org.knowm.xchart.style.markers.None;

public class test {

    public static void main(String[] args) {

        //============================
        // パラメータ
        //============================

        double M = 1000.0;   // ton
        double K = 40.0;     // kN/mm
        double h = 0.02;     // 減衰比

        double w = Math.sqrt(K * 1000.0 / M);

        System.out.println("w = " + w);

        //============================
        // 地震波データ読込
        //============================

        String filePath = "C:/Users/d/Desktop/就活/プログラム/地震波・csv形式/1.newhall_NS.csv";

        List<double[]> matrix = new ArrayList<>();

        try {

            List<String> lines = Files.readAllLines(Paths.get(filePath));

            for (int n = 1; n < lines.size(); n++) {

                String line = lines.get(n);

                if (line.isBlank()) {
                    continue;
                }

                String[] data = line.split(",");

                double[] row = new double[data.length];

                for (int i = 0; i < data.length; i++) {
                    row[i] = Double.parseDouble(data[i]);
                }

                matrix.add(row);
            }

        } catch (IOException e) {
            e.printStackTrace();
            return;
        }

        //============================
        // CSVの内容を表示
        //============================

        System.out.println("CSVデータ");

        for (double[] row : matrix) {

            for (double value : row) {
                System.out.print(value + " ");
            }

            System.out.println();
        }

        //============================
        // 時刻刻み
        //============================
        double dt = 0.0;
        if (matrix.size() >= 2) {

            dt = matrix.get(1)[0] - matrix.get(0)[0];

            System.out.println("t = " + dt);
        }

        //============================
        // 時刻歴応答解析
        //============================

        double y_acc = 0.0;
        double y_vel = 0.0;
        double y_dis = 0.0;

        List<Double> acc = new ArrayList<>();
        List<Double> vel = new ArrayList<>();
        List<Double> disp = new ArrayList<>();

        List<Double> time = new ArrayList<>();

        System.out.println(matrix.size());

        for (int i = 0; i < matrix.size(); i++) {

            // 地動加速度（CSVの2列目）
            double groundAcc = matrix.get(i)[1];

            // 次ステップ加速度
            double y_acc_next = -(
                    groundAcc
                            + 2.0 * h * w * (y_vel + 0.5 * y_acc * dt)
                            + w * w * (y_dis + y_vel * dt + 0.25 * y_acc * dt * dt)
            ) / (
                    1.0 + h * w * dt + 0.25 * w * w * dt * dt
            );

            // 次ステップ速度
            double y_vel_next = y_vel + 0.5 * (y_acc + y_acc_next) * dt;

            // 次ステップ変位
            double y_dis_next = y_dis + y_vel * dt
                    + 0.25 * (y_acc + y_acc_next) * dt * dt;

            // 保存
            acc.add(y_acc_next);
            vel.add(y_vel_next);
            disp.add(y_dis_next);

            // 更新
            y_acc = y_acc_next;
            y_vel = y_vel_next;
            y_dis = y_dis_next;

            time.add(matrix.get(i)[0]);   // 時刻
        }

        /*
        System.out.println("加速度");
        for (double value : acc) {
            System.out.println(value);
        }

        System.out.println("速度");
        for (double value : vel) {
            System.out.println(value);
        }

        System.out.println("変位");
        for (double value : disp) {
            System.out.println(value);
        }

        */

        XYChart chart = new XYChartBuilder()
                .width(800)
                .height(600)
                .title("変位時刻歴")
                .xAxisTitle("Time [s]")
                .yAxisTitle("Displacement")
                .build();

        XYSeries series = chart.addSeries("Disp", time, disp);

        series.setMarker(new None());   // 点を消す


        new SwingWrapper<>(chart).displayChart();


    }

}

