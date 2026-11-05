import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../api/models.dart';
import '../state/providers.dart';
import '../theme.dart';
import '../widgets/common.dart';

class QuotesScreen extends ConsumerStatefulWidget {
  const QuotesScreen({super.key, required this.search});
  final QuoteSearch search;
  @override
  ConsumerState<QuotesScreen> createState() => _QuotesScreenState();
}

class _QuotesScreenState extends ConsumerState<QuotesScreen> {
  late Future<({List<Quote> quotes, List<String> errors})> _future = ref.read(apiProvider).searchQuotes(widget.search);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Choose your ride')),
      body: FutureBuilder(
        future: _future,
        builder: (context, snap) {
          if (snap.hasError) return ErrorView(snap.error!, onRetry: () => setState(() => _future = ref.read(apiProvider).searchQuotes(widget.search)));
          if (!snap.hasData) return const Center(child: CircularProgressIndicator());
          final quotes = [...snap.data!.quotes]..sort((a, b) => a.price.customerPrice.compareTo(b.price.customerPrice));
          if (quotes.isEmpty) return const ErrorView('No cars available for this search. Try another time or location.');
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: quotes.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (_, i) {
              final q = quotes[i];
              return Card(
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => context.push('/checkout/${q.id}'),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(children: [
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(q.vehicle.name, style: Theme.of(context).textTheme.titleLarge),
                          const SizedBox(height: 4),
                          Text('${q.supplierName} · ${q.vehicle.passengers} passengers · ${q.vehicle.bags} bags${q.etaMinutes != null ? ' · ${q.etaMinutes} min away' : ''}', style: const TextStyle(color: RdColors.muted, fontSize: 13)),
                          const SizedBox(height: 6),
                          Text(q.cancellation, style: const TextStyle(color: RdColors.muted, fontSize: 12)),
                        ]),
                      ),
                      Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                        Text(q.price.display, style: Theme.of(context).textTheme.titleLarge),
                        const Text('Total', style: TextStyle(color: RdColors.muted, fontSize: 12)),
                      ]),
                    ]),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
