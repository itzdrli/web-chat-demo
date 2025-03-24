import { Factory, Exporter } from 'reggol';

const lf = new Factory();
lf.addExporter(new Exporter.Console());

export default function (name: string) {
  return lf.createLogger(name);
}